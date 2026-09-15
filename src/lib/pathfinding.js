const distanceBetween = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
const FLOOR_LEVELS = { GF: 0, "2F": 1, "3F": 2, "4F": 3, "5F": 4 }

const buildAdjacency = (nodes, edges) => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const adjacency = new Map(nodes.map((node) => [node.id, []]))

  edges.filter((edge) =>
    edge.walkable !== false &&
    edge.blocked !== true &&
    edge.restricted !== true &&
    edge.nonNavigable !== true &&
    edge.status !== "UNDER_CONSTRUCTION" &&
    edge.status !== "RESTRICTED" &&
    edge.status !== "NON_NAVIGABLE"
  ).forEach((edge) => {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (!from || !to) return

    const weight = edge.weight ?? distanceBetween(from, to)
    adjacency.get(edge.from).push({ nodeId: edge.to, weight, edgeId: edge.id })
    if (edge.bidirectional !== false) {
      adjacency.get(edge.to).push({ nodeId: edge.from, weight, edgeId: edge.id })
    }
  })

  return { nodeMap, adjacency, edgeMap: new Map(edges.map((edge) => [edge.id, edge])) }
}

const floorHeuristic = (node, destinationNode, minimumTransitionWeight) => {
  const nodeLevel = FLOOR_LEVELS[node.floorId]
  const destinationLevel = FLOOR_LEVELS[destinationNode.floorId]
  if (!Number.isFinite(nodeLevel) || !Number.isFinite(destinationLevel) || !minimumTransitionWeight) return 0
  return Math.abs(destinationLevel - nodeLevel) * minimumTransitionWeight
}

const reconstructPath = (cameFrom, currentId) => {
  const nodeIds = [currentId]
  const edgeIds = []
  while (cameFrom.has(currentId)) {
    const previous = cameFrom.get(currentId)
    edgeIds.unshift(previous.edgeId)
    currentId = previous.nodeId
    nodeIds.unshift(currentId)
  }
  return { nodeIds, edgeIds }
}

export function findShortestPath({ nodes, edges, startNodeId, destinationNodeId }) {
  const { nodeMap, adjacency, edgeMap } = buildAdjacency(nodes, edges)
  const startNode = nodeMap.get(startNodeId)
  const destinationNode = nodeMap.get(destinationNodeId)

  if (!startNode || !destinationNode) {
    throw new Error("A valid start and destination node are required.")
  }

  const transitionWeights = edges
    .filter((edge) => edge.type === "FLOOR_TRANSITION" && edge.walkable !== false && edge.blocked !== true)
    .map((edge) => Number(edge.weight))
    .filter((weight) => Number.isFinite(weight) && weight > 0)
  const minimumTransitionWeight = transitionWeights.length ? Math.min(...transitionWeights) : 0

  const openSet = new Set([startNodeId])
  const cameFrom = new Map()
  const distanceFromStart = new Map(nodes.map((node) => [node.id, Number.POSITIVE_INFINITY]))
  const estimatedTotal = new Map(nodes.map((node) => [node.id, Number.POSITIVE_INFINITY]))
  distanceFromStart.set(startNodeId, 0)
  estimatedTotal.set(startNodeId, floorHeuristic(startNode, destinationNode, minimumTransitionWeight))

  while (openSet.size > 0) {
    const currentId = [...openSet].reduce((bestId, candidateId) =>
      estimatedTotal.get(candidateId) < estimatedTotal.get(bestId) ? candidateId : bestId
    )

    if (currentId === destinationNodeId) {
      const { nodeIds, edgeIds } = reconstructPath(cameFrom, currentId)
      const routeNodes = nodeIds.map((nodeId) => nodeMap.get(nodeId))
      const routeEdges = edgeIds.map((edgeId) => edgeMap.get(edgeId))
      const totalMapUnits = routeEdges.reduce((total, edge, index) =>
        edge?.type === "FLOOR_TRANSITION" ? total : total + distanceBetween(routeNodes[index], routeNodes[index + 1]), 0)
      const floorChanges = routeEdges.reduce((total, edge) => total + (edge?.floorChange || 0), 0)
      const routeFloorIds = routeNodes.reduce((floorIds, node) => {
        if (floorIds.at(-1) !== node.floorId) floorIds.push(node.floorId)
        return floorIds
      }, [])

      return {
        nodeIds,
        edgeIds,
        nodes: routeNodes,
        edges: routeEdges,
        totalMapUnits,
        totalCost: distanceFromStart.get(currentId),
        floorChanges,
        routeFloorIds,
      }
    }

    openSet.delete(currentId)
    for (const neighbor of adjacency.get(currentId) || []) {
      const tentativeDistance = distanceFromStart.get(currentId) + neighbor.weight
      if (tentativeDistance >= distanceFromStart.get(neighbor.nodeId)) continue

      cameFrom.set(neighbor.nodeId, { nodeId: currentId, edgeId: neighbor.edgeId })
      distanceFromStart.set(neighbor.nodeId, tentativeDistance)
      estimatedTotal.set(
        neighbor.nodeId,
        tentativeDistance + floorHeuristic(nodeMap.get(neighbor.nodeId), destinationNode, minimumTransitionWeight)
      )
      openSet.add(neighbor.nodeId)
    }
  }

  return null
}
