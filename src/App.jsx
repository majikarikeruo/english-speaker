import React, { useState, useEffect, useRef } from "react";
import { Mic, Volume2, RefreshCw } from "lucide-react";

const words = [
  "hello",
  "world",
  "pronunciation",
  "experience",
  "technology",
  "communication",
  "opportunity",
  "development",
  "environment",
  "understanding",
];
import "./App.css";

const App = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setUserInput(transcript);
        evaluatePronunciation(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.log("Speech recognition not supported");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    getNewWord();
  }, []);

  const getNewWord = () => {
    const newWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(newWord);
    setUserInput("");
    setScore(null);
    setFeedback("");
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const evaluatePronunciation = (transcript) => {
    const similarity = calculateSimilarity(currentWord, transcript);
    const newScore = Math.round(similarity * 100);
    setScore(newScore);

    if (newScore >= 90) {
      setFeedback("Excellent pronunciation!");
    } else if (newScore >= 70) {
      setFeedback("Good job! Keep practicing.");
    } else {
      setFeedback("Try again. Focus on each sound.");
    }
  };

  const calculateSimilarity = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1)
      .fill(null)
      .map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return 1 - matrix[len2][len1] / Math.max(len1, len2);
  };

  const speakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = "en-US";
      synthRef.current.speak(utterance);
    } else {
      console.log("Speech synthesis not supported");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">英語発音トレーナー</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">発音してみよう:</h2>
          <p className="text-4xl font-bold text-blue-600">{currentWord}</p>
          <button
            onClick={speakWord}
            className="mt-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <Volume2 />
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <button
            onClick={toggleListening}
            className={`p-4 rounded-full ${
              isListening ? "bg-red-500" : "bg-blue-500"
            } text-white`}
          >
            {isListening ? <Mic className="animate-pulse" /> : <Mic />}
          </button>
        </div>
        {userInput && (
          <div className="text-center mb-4">
            <p className="text-lg">あなたの発音:</p>
            <p className="text-xl font-semibold">{userInput}</p>
          </div>
        )}
        {score !== null && (
          <div className="text-center mb-4">
            <p className="text-lg">スコア:</p>
            <p
              className="text-3xl font-bold"
              style={{ color: `hsl(${score}, 100%, 50%)` }}
            >
              {score}%
            </p>
          </div>
        )}
        {feedback && (
          <div className="text-center mb-4">
            <p className="text-lg font-semibold">{feedback}</p>
          </div>
        )}
        <button
          onClick={getNewWord}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <RefreshCw className="mr-2" /> 次の単語
        </button>
      </div>
    </div>
  );
};

export default App;
