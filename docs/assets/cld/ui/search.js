;(function (W){
  var CORE = W.CLD_CORE || {};

  function bindSearch(root){
    root = root || document;
    var box = root.querySelector('[data-search="node"]');
    if (!box) return;

    // Add input event listener for real-time search
    box.addEventListener('input', function(e){
      var query = (e.target.value || '').trim().toLowerCase();
      var cy = CORE.getCy && CORE.getCy();
      if (!cy) return;

      cy.batch(function(){
        if (!query) {
          // If search is empty, show all nodes and reset styles
          cy.nodes().removeClass('dimmed highlighted');
          cy.nodes().show();
          cy.edges().show();
        } else {
          // Search nodes by label or id
          var matches = cy.nodes().filter(function(node){
            var label = (node.data('label') || node.data('id') || '').toLowerCase();
            return label.indexOf(query) !== -1;
          });

          // Highlight matches and dim others
          cy.nodes().removeClass('dimmed highlighted');
          matches.addClass('highlighted');
          cy.nodes().difference(matches).addClass('dimmed');

          // Show connected edges for matched nodes
          cy.edges().removeClass('dimmed highlighted');
          var connectedEdges = matches.connectedEdges();
          connectedEdges.addClass('highlighted');
          cy.edges().difference(connectedEdges).addClass('dimmed');
        }
      });
    });

    // Add keydown listener for ESC to clear search
    box.addEventListener('keydown', function(e){
      if (e.key === 'Escape' || e.keyCode === 27) {
        box.value = '';
        box.dispatchEvent(new Event('input'));
      }
    });
  }

  W.CLD_UI = Object.assign({}, W.CLD_UI||{}, { bindSearch: bindSearch });
})(typeof window!=='undefined'?window:this);

