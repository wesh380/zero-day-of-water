(function(){
  /**
   * شناسایی حلقه‌های ساده در گراف Cytoscape.
   * برای استفاده: cydetectLoops(cy) را صدا بزنید تا آرایه‌ای از چرخه‌ها بازگردد.
   * cycleToClasses(c) شناسه‌های گره و یال چرخه را برای افزودن کلاس برمی‌گرداند.
   */
  function cydetectLoops(cy){
    var cycles = [];
    var seen = new Set();
    var nodes = cy.nodes().map(function(n){ return n.id(); });

    nodes.forEach(function(startId){
      var path = [startId];
      var edgePath = [];
      var visited = new Set([startId]);

      function dfs(currentId){
        var current = cy.getElementById(currentId);
        current.outgoers('edge').forEach(function(edge){
          var nextId = edge.target().id();
          if(nextId === startId){
            var cycleNodes = path.slice();
            var cycleEdges = edgePath.concat(edge.id());
            var key = canonicalKey(cycleNodes, cycleEdges);
            if(!seen.has(key)){
              seen.add(key);
              cycles.push({nodeIds: cycleNodes.slice(), edgeIds: cycleEdges.slice()});
            }
          } else if(!visited.has(nextId)){
            visited.add(nextId);
            path.push(nextId);
            edgePath.push(edge.id());
            dfs(nextId);
            path.pop();
            edgePath.pop();
            visited.delete(nextId);
          }
        });
      }

      dfs(startId);
    });

    return cycles;

    function canonicalKey(nodeIds, edgeIds){
      var n = nodeIds.length;
      var minIndex = 0;
      for(var i=1;i<n;i++){
        if(nodeIds[i] < nodeIds[minIndex]) minIndex = i;
      }
      var nodesRot = [];
      var edgesRot = [];
      for(var j=0;j<n;j++){
        nodesRot.push(nodeIds[(j+minIndex)%n]);
        edgesRot.push(edgeIds[(j+minIndex)%n]);
      }
      return nodesRot.join('>') + '|' + edgesRot.join('>');
    }
  }

  function cycleToClasses(cycle){
    return {
      nodeIds: cycle.nodeIds ? cycle.nodeIds.slice() : (cycle.nodes ? cycle.nodes.slice() : []),
      edgeIds: cycle.edgeIds ? cycle.edgeIds.slice() : (cycle.edges ? cycle.edges.slice() : [])
    };
  }

  window.cydetectLoops = cydetectLoops;
  window.cycleToClasses = cycleToClasses;
})();
