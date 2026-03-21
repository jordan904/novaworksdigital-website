(function() {
  var canvas = document.getElementById('dotGrid');
  if (!canvas) return;

  // Respect reduced motion
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ctx = canvas.getContext('2d');
  var spacing = 40;
  var baseRadius = 1;
  var time = 0;
  var animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  var resizeTimer;
  window.addEventListener('resize', function() {
    if (resizeTimer) return;
    resizeTimer = setTimeout(function() {
      resizeTimer = null;
      resize();
    }, 200);
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var cols = Math.ceil(canvas.width / spacing) + 1;
    var rows = Math.ceil(canvas.height / spacing) + 1;

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var x = col * spacing;
        var y = row * spacing;

        // Wave effect — multiple sine waves in different directions
        var wave1 = Math.sin((x * 0.008) + (y * 0.006) + time * 0.4) * 0.5 + 0.5;
        var wave2 = Math.sin((x * 0.005) - (y * 0.009) + time * 0.3) * 0.5 + 0.5;
        var wave3 = Math.sin((x * 0.007) + (y * 0.004) - time * 0.5) * 0.5 + 0.5;

        var combined = (wave1 + wave2 + wave3) / 3;

        var opacity = 0.06 + combined * 0.35;
        var radius = baseRadius + combined * 1.2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, ' + opacity + ')';
        ctx.fill();
      }
    }

    if (!prefersReduced) {
      time += 0.045;
      animId = requestAnimationFrame(draw);
    }
  }

  if (prefersReduced) {
    // Static dots, no animation
    draw();
  } else {
    animId = requestAnimationFrame(draw);
  }

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (!prefersReduced) {
      animId = requestAnimationFrame(draw);
    }
  });
})();
