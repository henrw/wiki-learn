import { useEffect, useState, useRef } from 'react';

export default function ControlPanel({ node, webColabManager }) {
  useEffect(() => {
    console.log('content view loaded');
  }, []);

  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  const [isHovered, setIsHovered] = useState('');

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Now you can safely access properties like scrollHeight
      // Example: console.log(textarea.scrollHeight);
    }
  }, [inputText]); // This effect runs whenever inputText changes

  const getElementInnerText = (element) => {
    if (!(element instanceof HTMLElement)) {
      console.error('Provided argument is not a valid HTMLElement.');
      return '';
    }
    console.log(element.innerText);
    return element.innerText;
  };

  const summarizeText = () => {
    webColabManager.setLock(true);
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
    webColabManager.setLock(false);
  };

  const explainText = () => {
    webColabManager.setLock(true);
    chrome.runtime.sendMessage(
      {
        action: 'fetchChatGPTResponse',
        question: 'Please explain this like I am five in one paragraph in direct narration: ' + getElementInnerText(node), //. Use hyperlink (<a href="/wiki/{Terminology}" title="{Terminology}">Terminology</a>) wrapping around terminologies that are in wikipedia:
      },
      response => {
        if (response.success) {
          console.log('Response from OpenAI:', response.response);
          webColabManager.setInnerText(response.response);
        } else {
          console.log('Error:', response.error);
        }
        webColabManager.setLock(false);

      },
    );
  };

  const generateQuiz = () => {
    webColabManager.setLock(true);
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
          console.log(typeof response.response);
          const quizData = JSON.parse(response.response);
          console.log(quizData);
          webColabManager.createQuiz('right', quizData);
        } else {
          console.log('Error:', response.error);
        }
        webColabManager.setLock(false);
      },
    );
  };

  return (
    <div className={`flex flex-col text-sm`}>
      {isHovered && (
        <div
          style={{
            visibility: isHovered ? 'visible' : 'hidden',
            width: '120px',
            backgroundColor: 'black',
            color: 'white',
            textAlign: 'center',
            borderRadius: '6px',
            padding: '5px 0',
            position: 'absolute',
            zIndex: 1001,
            bottom: '100%',
            left: '50%',
            marginLeft: '-60px', // Adjust based on the width of the tooltip
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}>
          {isHovered}
        </div>
      )}
      <button
        className="w-12 border border-1 border-black p-1 rounded-md mb-1"
        onClick={() => {
          explainText();
        }}
        onMouseEnter={() => {
          setIsHovered('Explain like I am five');
        }}
        onMouseLeave={() => setIsHovered('')}>
        <svg className="w-full h-auto" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0.990538 1.0377L1.36626 0L1.81029 1.07173L2.7496 1.41196L1.75906 1.85425L1.36626 2.82391L0.922225 1.82023L0 1.41196L0.990538 1.0377ZM6.65094 3.56704L7.46838 1.30048L8.43446 3.64135L10.4781 4.38448L8.32299 5.35056L7.46838 7.46849L6.50231 5.27625L4.49585 4.38448L6.65094 3.56704ZM1.36626 7.43133L0.990538 8.46904L0 8.84329L0.922225 9.25157L1.36626 10.2552L1.75906 9.28559L2.7496 8.84329L1.81029 8.50306L1.36626 7.43133ZM21.7934 8.42332L22.1691 7.38562L22.6131 8.45734L23.5524 8.79757L22.5619 9.23987L22.1691 10.2095L21.725 9.20585L20.8028 8.79757L21.7934 8.42332ZM19.2148 10.463L18.8391 11.5007L17.8486 11.8749L18.7708 12.2832L19.2148 13.2869L19.6076 12.3172L20.5982 11.8749L19.6589 11.5347L19.2148 10.463ZM13.1779 1.0377L13.5536 0L13.9977 1.07173L14.937 1.41196L13.9464 1.85425L13.5536 2.82391L13.1096 1.82023L12.1874 1.41196L13.1779 1.0377ZM19.2472 0.891753L0.185797 19.9903L3.12118 23L22.2569 3.90145L19.2472 0.891753ZM15.0114 7.09694L19.2472 2.82391L20.3248 3.90146L16.0889 8.17448L15.0114 7.09694ZM2.15515 19.9531L6.39102 15.6801L7.46856 16.7577L3.2327 21.0307L2.15515 19.9531Z"
            fill="#444444"
          />
        </svg>
      </button>
      <button
        className="w-12 border border-1 border-black p-1 rounded-md"
        onClick={() => {
          generateQuiz();
        }}
        onMouseEnter={() => {
          setIsHovered('Quiz me');
        }}
        onMouseLeave={() => setIsHovered('')}>
        <svg className="w-full h-auto" viewBox="0 0 244 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M81 86.5C81 78.4899 83.3753 70.6596 87.8255 63.9994C92.2757 57.3392 98.6009 52.1482 106.001 49.0829C113.402 46.0175 121.545 45.2155 129.401 46.7782C137.257 48.3409 144.474 52.1982 150.138 57.8622C155.802 63.5262 159.659 70.7426 161.222 78.5989C162.785 86.4551 161.982 94.5983 158.917 101.999C155.852 109.399 150.661 115.724 144.001 120.175C137.34 124.625 129.51 127 121.5 127V164"
            stroke="black"
            stroke-width="15"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="122" cy="193" r="15" fill="black" />
          <path
            d="M177.535 18.4415C199.685 30.7971 217.082 50.1868 226.974 73.542C236.865 96.8972 238.685 122.884 232.146 147.39C225.607 171.896 211.083 193.522 190.871 208.845C170.66 224.168 145.915 232.313 120.554 231.991C95.1925 231.669 70.6626 222.899 50.8462 207.068C31.0298 191.237 17.0585 169.25 11.1434 144.586C5.22836 119.922 7.70725 93.99 18.1878 70.8933C28.6684 47.7965 46.5521 28.8545 69.0089 17.0647"
            stroke="black"
            stroke-width="15"
            stroke-linecap="round"
          />
          <path
            d="M93.8068 22.9091H97.9886L100.091 25.6136L102.159 28.0227L106.057 32.9091H101.466L98.7841 29.6136L97.4091 27.6591L93.8068 22.9091ZM106.409 19.3636C106.409 21.9015 105.928 24.0606 104.966 25.8409C104.011 27.6212 102.708 28.9811 101.057 29.9205C99.4129 30.8523 97.5644 31.3182 95.5114 31.3182C93.4432 31.3182 91.5871 30.8485 89.9432 29.9091C88.2992 28.9697 87 27.6098 86.0455 25.8295C85.0909 24.0492 84.6136 21.8939 84.6136 19.3636C84.6136 16.8258 85.0909 14.6667 86.0455 12.8864C87 11.1061 88.2992 9.75 89.9432 8.81818C91.5871 7.87879 93.4432 7.40909 95.5114 7.40909C97.5644 7.40909 99.4129 7.87879 101.057 8.81818C102.708 9.75 104.011 11.1061 104.966 12.8864C105.928 14.6667 106.409 16.8258 106.409 19.3636ZM101.42 19.3636C101.42 17.7197 101.174 16.3333 100.682 15.2045C100.197 14.0758 99.5114 13.2197 98.625 12.6364C97.7386 12.053 96.7008 11.7614 95.5114 11.7614C94.322 11.7614 93.2841 12.053 92.3977 12.6364C91.5114 13.2197 90.822 14.0758 90.3295 15.2045C89.8447 16.3333 89.6023 17.7197 89.6023 19.3636C89.6023 21.0076 89.8447 22.3939 90.3295 23.5227C90.822 24.6515 91.5114 25.5076 92.3977 26.0909C93.2841 26.6742 94.322 26.9659 95.5114 26.9659C96.7008 26.9659 97.7386 26.6742 98.625 26.0909C99.5114 25.5076 100.197 24.6515 100.682 23.5227C101.174 22.3939 101.42 21.0076 101.42 19.3636ZM124.429 7.72727H129.349V22.8409C129.349 24.5379 128.944 26.0227 128.134 27.2955C127.33 28.5682 126.205 29.5606 124.759 30.2727C123.312 30.9773 121.626 31.3295 119.702 31.3295C117.77 31.3295 116.08 30.9773 114.634 30.2727C113.187 29.5606 112.062 28.5682 111.259 27.2955C110.455 26.0227 110.054 24.5379 110.054 22.8409V7.72727H114.974V22.4205C114.974 23.3068 115.168 24.0947 115.554 24.7841C115.948 25.4735 116.501 26.0152 117.213 26.4091C117.925 26.803 118.755 27 119.702 27C120.656 27 121.486 26.803 122.19 26.4091C122.902 26.0152 123.452 25.4735 123.838 24.7841C124.232 24.0947 124.429 23.3068 124.429 22.4205V7.72727ZM138.318 7.72727V31H133.398V7.72727H138.318ZM142.116 31V28.0795L153.73 11.7841H142.094V7.72727H159.912V10.6477L148.287 26.9432H159.935V31H142.116Z"
            fill="black"
          />
        </svg>
      </button>

      {/* <button
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
          </button> */}
    </div>
  );
}
