// 'use client';
import { useState } from 'react';
// import { motion } from "framer-motion";
// import Link from "next/link";
// import useMeasure from "react-use-measure";

// import { collection, addDoc, setDoc, doc, serverTimestamp, arrayUnion, updateDoc } from "firebase/firestore";
// import { db } from "@/app/clientApp";
// import { useID } from '../store/useID';

interface Props {
  id: string;
  question: string;
  choices: string[];
  correctAnsId: number;
  explanations: string[];
  hint: string;
}

function MCQ({ id, question, choices, correctAnsId, explanations, hint }: Props) {
  // const { userID } = useID();

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isHinted, setIsHinted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  // let [ref, { height }] = useMeasure();

  // const storeAndSetIsChecked = (check: boolean) => {
  //     setIsChecked(check);
  //     setDoc(doc(db, "users", userID), { "exercises": { [id]: {"type": "multiple", "attempts": arrayUnion(selectedIndex), "completeTime": serverTimestamp()} } }, { "merge": true });
  // }

  return (
    <>
      <div
        className="box-content h-min w-60 text-sm p-4 rounded-lg outline outline-1 outline-[#989898] example"
        // animate={{ height }}
        // transition={{ duration: 0.3 }}
      >
        {/* <div ref={ref}> */}
        <div>
          <h1 className="font-bold">{question}</h1>
          <ul className="my-2">
            {choices?.map((choice: string, idx) => (
              <button
                key={'button_' + idx + '_' + choice}
                className={`box-border border-1 w-full text-left rounded-lg my-1 p-2 ${selectedIndex === idx ? (isChecked ? (selectedIndex === correctAnsId ? 'bg-green-100' : 'bg-red-100') : 'bg-blue-100') : 'bg-white'}`}
                onClick={() => {
                  setSelectedIndex(idx);
                  console.log(explanations);
                }}
                disabled={isChecked}>
                {choice}
              </button>
            ))}
          </ul>

          {isChecked && selectedIndex === correctAnsId && (
            <div className="my-1">
              <h2 className="text-green-600">Correct</h2>
              <div>{explanations[selectedIndex]}</div>
            </div>
          )}
          {isChecked && selectedIndex !== correctAnsId && (
            <div className="my-1">
              <h2 className="text-red-600">Incorrect</h2>
              <div>{explanations[selectedIndex]}</div>
            </div>
          )}
          {isHinted && !isChecked && (
            <div className="my-1">
              <div>{hint}</div>
            </div>
          )}

          {
            <div className="flex justify-between">
              <button
                className="text-left rounded-lg px-3 py-1 border-2 border-black"
                onClick={() => setIsHinted(!isHinted)}>
                Hint
              </button>
              {!isChecked ? (
                <button
                  className={`text-right rounded-lg px-3 py-1 text-white ${selectedIndex == -1 ? 'bg-gray' : 'bg-black'}`}
                  onClick={() => {
                    setIsHinted(false);
                    setIsChecked(true);
                  }}
                  disabled={selectedIndex == -1}>
                  Check
                </button>
              ) : (
                <button
                  className={`text-right rounded-lg px-3 py-1 text-white ${selectedIndex == -1 ? 'bg-gray' : 'bg-black'}`}
                  onClick={() => {
                    setIsHinted(false);
                    setIsChecked(false);
                    setSelectedIndex(-1);
                  }}>
                  Try again
                </button>
              )}
            </div>
          }
        </div>
      </div>
      {/* </motion.div> */}
    </>
  );
}

export default MCQ;
