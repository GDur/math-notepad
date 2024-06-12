import { CodeJar } from 'codejar';
import hljs from 'highlight.js';

import * as math from 'mathjs';
import './hljs/myMathjs';


export const log = console.log.bind(document)

// Define the value of 1 Ah in coulombs (e.g., 1 Ah = 3600 C)
// makes sure that Ah * V = Wh
math.createUnit("Ah", "3600 C")
math.createUnit("mAh", "3600 mC")

math.createUnit("ly", "9460730472580800 meters")
math.createUnit("lightyear", "9460730472580800 meters")

math.createUnit(
  {
    'EUR': {
    },
    'USD': {
    }
  },
  {
    override: true
  }
)

const wait = 100;

const intro = `# intro

price = .25 EUR / kWh

price * 6000 kWh / 365 days `;

const intro_doc = {
  description: 'You can type math.js expressions and see the result.',
  examples: [
    '2 + 2',
    'round(e, 3)',
    'log(100000, 10)',
    '10cm to inch',
    'sin(90 deg)',
    'det([-1, 2; 3, 1])',
    '1 kg * 1 m / s^2',
    'help("round")',
  ]
}

const help = document.querySelector('#help')! as HTMLElement
const help_name = document.querySelector('#help_name')! as HTMLElement
const help_description = document.querySelector('#help_description')! as HTMLElement
const help_syntax_code = document.querySelector('#help_syntax_code')! as HTMLElement
const help_syntax = document.querySelector('#help_syntax')! as HTMLElement
const help_examples_code = document.querySelector('#help_examples_code')! as HTMLElement
const help_examples = document.querySelector('#help_examples')! as HTMLElement
const help_seealso_text = document.querySelector('#help_seealso_text')! as HTMLElement
const help_seealso = document.querySelector('#help_seealso')! as HTMLElement

function showDoc(doc) {
  if (!doc) {
    help.style.display = 'none';
    return;
  }

  function hideEmpty(elem, value) {
    elem.style.display = value ? 'block' : 'none';
  }

  help_name.textContent = doc.name;
  help_description.textContent = doc.description;

  help_syntax_code.textContent = doc.syntax?.join("\n");
  delete help_syntax_code.dataset.highlighted
  hljs.highlightElement(help_syntax_code);
  hideEmpty(help_syntax, doc.syntax);

  help_examples_code.textContent = doc.examples?.join("\n");
  delete help_examples_code.dataset.highlighted
  hljs.highlightElement(help_examples_code);
  hideEmpty(help_examples, doc.examples);

  help_seealso_text.textContent = doc.seealso?.join(", ");
  hideEmpty(help_seealso, doc.seealso);

  help.style.display = 'block';
}





const inputEditor = document.querySelector('#input')! as HTMLElement
const outputResults = document.querySelector('#output')! as HTMLElement

inputEditor.addEventListener('drop', (event) => {
  dropHandler(event)
})

const editor = CodeJar(inputEditor, hljs.highlightElement);
const results = CodeJar(outputResults, hljs.highlightElement);
hljs.configure({ ignoreUnescapedHTML: true });

function doMath(input) {
  let outputs: string[] = [];
  let scope = {};
  let doc;

  for (const line of input.split('\n')) {
    let output_line = '';
    if (line) {
      if (line.startsWith('#')) {
        if (line == '# intro') {
          doc = intro_doc;
        }
        output_line = '#';
      } else {
        try {
          const r = math.evaluate(line, scope);
          if (r) {
            if (r.doc) {
              doc = r.doc;
            }
            else {
              output_line = math.format(r, { precision: 3 });
            }
          }
        } catch (e) {
          output_line = e.toString();
        }
      }
    }
    outputs.push(output_line);
  }

  delete outputResults.dataset.highlighted
  results.updateCode(outputs.join('\n'));

  // showDoc(doc);
}

function dropHandler(ev) {
  ev.preventDefault();

  const file = ev.dataTransfer.items[0].getAsFile();
  file.text().then(e => editor.updateCode(e));
}

async function start(url: string) {
  let code = intro;
  if (url) {
    code = await (await fetch(url)).text();
  }


  delete inputEditor.dataset.highlighted
  editor.updateCode(code);

  doMath(editor.toString());

}

let timer = 0;

editor.onUpdate(code => {
  clearTimeout(timer);
  timer = setTimeout(doMath, wait, code);
});

const params = new URLSearchParams(window.location.search);
start(params.get('input')!);