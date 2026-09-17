(function () {
  'use strict';
  var root = document.documentElement;
  var preference = null;
  try { preference = localStorage.getItem('homepage-theme'); } catch (e) {}
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var button = document.querySelector('.theme-toggle');
    if (button) {
      var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#181a1f' : '#ffffff';
  }
  if (preference !== 'light' && preference !== 'dark') preference = null;
  apply(preference || (system.matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', function () {
    apply(root.getAttribute('data-theme'));
    document.querySelector('.theme-toggle').addEventListener('click', function () {
      preference = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem('homepage-theme', preference); } catch (e) {}
    });
  });
  system.addEventListener('change', function (event) {
    if (!preference) apply(event.matches ? 'dark' : 'light');
  });
}());
