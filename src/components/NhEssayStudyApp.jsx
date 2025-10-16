import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function NhEssayStudyApp() {
  const [quizData, setQuizData] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");
  const [showNicknamePopup, setShowNicknamePopup] = useState(!localStorage.getItem("nickname"));

  const current = quizData[step] || {};

  // ✅ 문제 데이터 불러오기
  async function loadQuizData() {
    if (!nickname) return;
    try {
      const res = await fetch(`/api/getQuizData?nickname=${nickname}`);
      const data = await res.json();
      if (data.quizData?.length) setQuizData(data.quizData);
      if (data.bookmarked) setBookmarked(data.bookmarked);
    } catch (e) {
      console.error("불러오기 실패:", e);
    }
  }

  // ✅ 문제 데이터 저장
  async function saveQuizData(updatedQuizData = quizData, updatedBookmarked = bookmarked) {
    if (!nickname) return;
    try {
      await fetch("/api/saveQuizData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizData: updatedQuizData,
          bookmarked: updatedBookmarked,
          nickname,
        }),
      });
    } catch (e) {
      console.error("저장 실패:", e);
    }
  }

  // 닉네임 입력 확인
  const handleConfirmNickname = () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");
    localStorage.setItem("nickname", nickname);
    setShowNicknamePopup(false);
    loadQuizData();
  };

  useEffect(() => {
    if (nickname) loadQuizData();
  }, []);

  const normalize = (str) => str.replace(/,|\s+/g, "").trim();

  const handleNext = (check = true) => {
    if (check && current.id) {
      const userAnswer = normalize(answers[current.id] || "");
      const correctAnswer = normalize(current.answer);
      const correct = userAnswer === correctAnswer;
      setIsCorrect(correct);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);

      if (!correct && !bookmarked.includes(current.id)) {
        const updated = [...bookmarked, current.id];
        setBookmarked(updated);
        saveQuizData(quizData, updated);
      } else if (correct && bookmarked.includes(current.id)) {
        const updated = bookmarked.filter((id) => id !== current.id);
        setBookmarked(updated);
        saveQuizData(quizData, updated);
      }
    }

    if (step < quizData.length - 1) {
      setStep(step + 1);
      setRevealAnswer(false);
    } else {
      alert("🎉 축하합니다! 모든 문제를 푸셨습니다!");
    }
  };

  const handleChange = (e) =>
    setAnswers({ ...answers, [current.id]: e.target.value });

  const handleGoToBookmarked = (id) => {
    const index = quizData.findIndex((q) => q.id === id);
    if (index !== -1) setStep(index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-green-100 p-6 relative">

      {/* ✅ 닉네임 팝업 */}
      {showNicknamePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center animate-fade-in">
            <h2 className="text-lg font-bold text-green-800 mb-4">
              🌱 닉네임을 입력해주세요
            </h2>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 상현"
              className="border p-2 rounded w-full mb-3 text-center"
            />
            <button
              onClick={handleConfirmNickname}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showPopup && (
        <div
          className={`fixed top-10 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 ${
            isCorrect ? "bg-green-600" : "bg-red-500"
          } animate-fade-in-out`}
        >
          {isCorrect
            ? "✅ 정답입니다!"
            : "❌ 오답입니다! 다시 볼 문제에 추가되었습니다."}
        </div>
      )}

      {/* 문제 카드 */}
      {quizData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative">
          <button
            onClick={() =>
              setBookmarked((prev) =>
                prev.includes(current.id)
                  ? prev.filter((id) => id !== current.id)
                  : [...prev, current.id]
              )
            }
            className={`absolute top-4 right-4 ${
              bookmarked.includes(current.id)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            <Star
              fill={bookmarked.includes(current.id) ? "currentColor" : "none"}
            />
          </button>

          <h1 className="text-2xl font-bold text-green-800 mb-4 text-center">
            🌾 2025 농협 논술 핵심 암기 스터디
          </h1>

          <p className="text-gray-800 font-medium mb-4 leading-relaxed">
            {current.question}
          </p>
          <input
            placeholder="답변 입력..."
            value={answers[current.id] || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full mb-4"
          />

          <div
            className="text-sm text-gray-700 mb-3 border p-2 rounded bg-white/70 cursor-pointer select-none"
            onClick={() => setRevealAnswer(!revealAnswer)}
          >
            <span className="font-semibold text-green-700">정답:</span>{" "}
            {revealAnswer ? (
              current.answer
            ) : (
              <span className="text-gray-400">[정답 보기]</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <button
              onClick={() => handleNext(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              다음 문제 (채점)
            </button>
            <button
              onClick={() => handleNext(false)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
              건너뛰기
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            {step + 1} / {quizData.length} 문제
          </div>

          {bookmarked.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                ⭐ 다시 볼 문제
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {bookmarked.map((id) => {
                  const q = quizData.find((q) => q.id === id);
                  return (
                    <li
                      key={id}
                      className="cursor-pointer hover:text-green-700"
                      onClick={() => handleGoToBookmarked(id)}
                    >
                      {q?.question}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }

        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
