import { useEffect, useState, useRef } from 'react';

export default function Menu({ node, webColabManager }) {
  useEffect(() => {
    console.log('content view loaded');
  }, []);

  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Now you can safely access properties like scrollHeight
      // Example: console.log(textarea.scrollHeight);
    }
  }, [inputText]); // This effect runs whenever inputText changes

  const getElementInnerText = element => {
    if (!(element instanceof HTMLElement)) {
      console.error('Provided argument is not a valid HTMLElement.');
      return '';
    }
    return element.innerText;
  };

  const summarizeText = () => {
    chrome.runtime.sendMessage(
      {
        action: 'fetchChatGPTResponse',
        question: 'Please summarize the information of this paragraph: ' + getElementInnerText(node),
      },
      response => {
        if (response.success) {
          console.log('Response from OpenAI:', response.response);
          webColabManager.setInnerText(response.response);
        } else {
          console.log('Error:', response.error);
        }
      },
    );
  };

  const explainText = () => {
    chrome.runtime.sendMessage(
      {
        action: 'fetchChatGPTResponse',
        question: 'Please explain this like I am five in one paragraph: ' + getElementInnerText(node), //. Use hyperlink (<a href="/wiki/{Terminology}" title="{Terminology}">Terminology</a>) wrapping around terminologies that are in wikipedia:
      },
      response => {
        if (response.success) {
          console.log('Response from OpenAI:', response.response);
          webColabManager.setInnerText(response.response);
        } else {
          console.log('Error:', response.error);
        }
      },
    );
  };

  const generateQuiz = () => {
    chrome.runtime.sendMessage(
      {
        action: 'fetchChatGPTResponse',
        question: `Please generate a quiz question that checks the understanding of the selected text:\n
                  ${getElementInnerText(node)}\n\n
                  Structure your response in a json dict; make sure that the order of choices and explanation and correct answer index is aligned:\n
                  {\n
                  "question": "{question}",\n
                  "choices": ["{choice1}", "{choice2}", "{choice3}", "{choice4}"],\n
                  "correctAnsId": "{correct answer's index (start from 0)}",\n
                  "explanations": ["{choice1 explanation}", "{choice2 explanation}", "{choice3 explanation}", "{choice4 explanation}"],\n
                  "hint": "{hint for the question}"\n
                  }`, //. Use hyperlink (<a href="/wiki/{Terminology}" title="{Terminology}">Terminology</a>) wrapping around terminologies that are in wikipedia:
      },
      response => {
        if (response.success) {
          console.log();
          try {
            const quizData = JSON.parse(response.response);
            const div = document.createElement('div');
            webColabManager.createQuiz('right', quizData);
          } catch (error) {
            console.log('Error: cannot parse ' + response.response);
          }
        } else {
          console.log('Error:', response.error);
        }
      },
    );
  };

  return (
    <div
      className={`flex flex-row items-stretch bg-white outline outline-1 outline-gray-400 rounded-md text-sm w-[${node.getBoundingClientRect().width}px]`}>
      <div className="flex items-center p-2 bg-gray-200">
        <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0.990538 1.0377L1.36626 0L1.81029 1.07173L2.7496 1.41196L1.75906 1.85425L1.36626 2.82391L0.922225 1.82023L0 1.41196L0.990538 1.0377ZM6.65094 3.56704L7.46838 1.30048L8.43446 3.64135L10.4781 4.38448L8.32299 5.35056L7.46838 7.46849L6.50231 5.27625L4.49585 4.38448L6.65094 3.56704ZM1.36626 7.43133L0.990538 8.46904L0 8.84329L0.922225 9.25157L1.36626 10.2552L1.75906 9.28559L2.7496 8.84329L1.81029 8.50306L1.36626 7.43133ZM21.7934 8.42332L22.1691 7.38562L22.6131 8.45734L23.5524 8.79757L22.5619 9.23987L22.1691 10.2095L21.725 9.20585L20.8028 8.79757L21.7934 8.42332ZM19.2148 10.463L18.8391 11.5007L17.8486 11.8749L18.7708 12.2832L19.2148 13.2869L19.6076 12.3172L20.5982 11.8749L19.6589 11.5347L19.2148 10.463ZM13.1779 1.0377L13.5536 0L13.9977 1.07173L14.937 1.41196L13.9464 1.85425L13.5536 2.82391L13.1096 1.82023L12.1874 1.41196L13.1779 1.0377ZM19.2472 0.891753L0.185797 19.9903L3.12118 23L22.2569 3.90145L19.2472 0.891753ZM15.0114 7.09694L19.2472 2.82391L20.3248 3.90146L16.0889 8.17448L15.0114 7.09694ZM2.15515 19.9531L6.39102 15.6801L7.46856 16.7577L3.2327 21.0307L2.15515 19.9531Z"
            fill="#444444"
          />
        </svg>
      </div>
      <div className="relative flex-grow">
        {/* <textarea
          className="w-full h-full outline-none rounded-md px-2 py-1" // Adjust size as needed
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ resize: 'none' }}
          placeholder="Type something..."
        /> */}
        <div className="absolute bottom-0 left-0 mb-0.5 ml-0.5 flex flex-row">
          {/* <button className="mx-1 px-1 py-0.5 bg-gray-200 rounded-full"
            onClick={() => { summarizeText() }}
          >
            summarize
          </button> */}
          <button
            className="mx-1 px-1 py-0.5 bg-gray-200 rounded-full"
            onClick={() => {
              explainText();
            }}>
            Explain like I am five
          </button>
          <button
            className="mx-1 px-1 py-0.5 bg-gray-200 rounded-full"
            onClick={() => {
              generateQuiz();
            }}>
            Quiz me
          </button>
        </div>
      </div>
    </div>
  );
}
