import { useEffect, useMemo, useState } from "react";
import { Star, Trash } from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded p-2 w-full focus:ring focus:ring-green-200 ${className}`}
    />
  );
}
function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-semibold text-white transition ${className}`}
    >
      {children}
    </button>
  );
}

const CATEGORIES = ["농업", "IT"];

export default function NhEssayStudyApp() {
  const [quizData, setQuizData] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    category: "",
    question: "",
    answer: "",
  });
  const [newQuestion, setNewQuestion] = useState({
    category: "농업",
    question: "",
    answer: "",
  });

  // 닉네임 관리
  const [nickname, setNickname] = useState("");
  const [showNicknamePopup, setShowNicknamePopup] = useState(true);

  // 카테고리 필터 상태
  const [selectedCategory, setSelectedCategory] = useState("전체");
  // 삭제 확인 상태
  const [deletingId, setDeletingId] = useState(null);
  // 완료 메시지 상태
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nickname");
    if (stored) {
      setNickname(stored);
      setShowNicknamePopup(false);
      loadQuizData(stored);
    }
  }, []);

  // 카테고리 필터링된 퀴즈 데이터
  const filteredQuizData = useMemo(() => {
    if (selectedCategory === "전체") return quizData;
    return quizData.filter((q) => q.category === selectedCategory);
  }, [quizData, selectedCategory]);

  const handleConfirmNickname = () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");
    localStorage.setItem("nickname", nickname);
    setShowNicknamePopup(false);
    loadQuizData(nickname);
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      setRevealAnswer(false);
    } else {
      alert("⏪ 첫 번째 문제입니다!");
    }
  };

  async function loadQuizData(name = nickname) {
    try {
      const res = await fetch(`/api/getQuizData?nickname=${name}`);
      const data = await res.json();
      if (data.quizData?.length) setQuizData(data.quizData);
      if (data.bookmarked) setBookmarked(data.bookmarked);
    } catch (e) {
      console.error("불러오기 실패:", e);
    }
  }

  async function saveQuizData(
    updatedQuizData = quizData,
    updatedBookmarked = bookmarked
  ) {
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

  const current = filteredQuizData[step] || {};
  const normalize = (str) => str.replace(/,|\s+/g, "").trim();

  const handleNext = (check = true, directInput) => {
    // 1. 마지막 문제인지 미리 확인
    const isLastQuestion = step === filteredQuizData.length - 1;
    const currentId = current.id;

    // ✅ 최신 입력값 우선 사용
    const userInput = directInput ?? answers[currentId] ?? "";
    const userAnswer = normalize(userInput);
    const correctAnswer = normalize(current.answer);

    if (check && currentId) {
      const correct = userAnswer === correctAnswer;
      setIsCorrect(correct);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 700);

      if (!correct && !bookmarked.includes(currentId)) {
        const updated = [...bookmarked, currentId];
        setBookmarked(updated);
        saveQuizData(quizData, updated);
      } else if (correct && bookmarked.includes(currentId)) {
        const updated = bookmarked.filter((id) => id !== currentId);
        setBookmarked(updated);
        saveQuizData(quizData, updated);
      }
    }


    // 2. 마지막 문제가 아니면 다음 문제로 이동
    if (!isLastQuestion) {
      setStep(step + 1);
      setRevealAnswer(false);
    } else {
      // 3. 마지막 문제인 경우
      // '채점'을 눌렀으면(check=true) 1.5초(팝업 시간) 뒤에, '건너뛰기'면 즉시 완료 메시지 표시
      const delay = check ? 1500 : 0;
      setTimeout(() => {
        setShowCompletionMessage(true);
        setTimeout(() => setShowCompletionMessage(false), 3000); // 3초간 완료 메시지 표시
      }, delay);
    }
  };

  const handleSelectEdit = (id) => {
    const q = quizData.find((q) => q.id === id);
    if (q) {
      setEditingId(id);
      setEditData({
        category: q.category,
        question: q.question,
        answer: q.answer,
      });
    }
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const updated = quizData.map((q) =>
        q.id === editingId ? { ...q, ...editData } : q
      );
      setQuizData(updated);
      setEditingId(null);
      saveQuizData(updated, bookmarked);
    }
  };

  const handleAddQuestion = () => {
    const newId = quizData.length ? quizData[quizData.length - 1].id + 1 : 1;
    const updated = [...quizData, { id: newId, ...newQuestion }];
    setQuizData(updated);

    const defaultCat =
      selectedCategory === "전체" ? CATEGORIES[0] : selectedCategory;
    setNewQuestion({ category: defaultCat, question: "", answer: "" });
    saveQuizData(updated, bookmarked);
  };

  const handleDeleteQuestion = (id) => {
    const updated = quizData.filter((q) => q.id !== id);
    setQuizData(updated);
    saveQuizData(updated, bookmarked);
  };

  // 삭제 확인 팝업
  const confirmDelete = () => {
    if (deletingId) {
      handleDeleteQuestion(deletingId);
      setDeletingId(null);
    }
  };

  // 엔터, [, ] 키를 통해서 이전 다음문제 가기기능
  useEffect(() => {
    if (editMode || showNicknamePopup) return;

    const handleKeyUp = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleNext(true, e.target.value);
      } else if (e.key === "[") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "]") {
        e.preventDefault();
        handleNext(false);
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [editMode, showNicknamePopup, step, filteredQuizData.length]);

  if (showNicknamePopup) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center animate-fade-in">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            🌱 닉네임을 입력해주세요
          </h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 강호동"
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
    );
  }



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-green-100 p-6 relative">
      {showPopup && (
        <div
          className={`fixed top-10 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 ${isCorrect ? "bg-green-600" : "bg-red-500"
            } animate-fade-in-out`}
        >
          {isCorrect
            ? "✅ 정답입니다!"
            : "❌ 오답입니다! 다시 볼 문제에 추가되었습니다."}
        </div>
      )}

      {/* 완료 메시지 팝업 */}
      {showCompletionMessage && (
        <div className="fixed top-10 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 bg-blue-500 animate-fade-in-out-3s">
          🎉 모든 문제를 완료했습니다!
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              정말 삭제하시겠습니까?
            </h2>
            <p className="text-gray-600 mb-6">ㄹㅇ로요?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                아니오
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="max-w-2xl w-full shadow-lg p-6 relative">
        <button
          onClick={() => setShowNicknamePopup(true)}
          className="absolute top-3 left-3 text-sm text-gray-600 underline"
        >
          닉네임 변경
        </button>

        <button
          onClick={() =>
            setBookmarked((prev) =>
              prev.includes(current.id)
                ? prev.filter((id) => id !== current.id)
                : [...prev, current.id]
            )
          }
          className={`absolute top-4 right-4 ${bookmarked.includes(current.id)
            ? "text-yellow-400"
            : "text-gray-300"
            }`}
        >
          <Star
            fill={bookmarked.includes(current.id) ? "currentColor" : "none"}
          />
        </button>

        <h1 className="text-2xl font-bold text-green-800 mb-4 text-center">
          🌾 2025 농협 논술 암기 페이지
        </h1>

        {/* 카테고리 필터 버튼 */}
        <div className="flex justify-center gap-2 mb-4">
          {["전체", ...CATEGORIES].map((cat) => {
  const base =
    "px-3 py-1 text-sm font-semibold text-white transition rounded";
  let activeColor = "";
  let inactiveColor = "bg-gray-300 text-gray-700 hover:bg-gray-400";

  if (cat === "전체") activeColor = "bg-gray-700 hover:bg-gray-800";
  if (cat === "농업") activeColor = "bg-green-600 hover:bg-green-700";
  if (cat === "IT") activeColor = "bg-blue-600 hover:bg-blue-700";

  const icons = {
    전체: "📚",
    농업: "🌾",
    IT: "💻",
  };

  return (
    <Button
      key={cat}
      onClick={() => {
        setSelectedCategory(cat);
        setStep(0);
        setRevealAnswer(false);
      }}
      className={`${base} ${
        selectedCategory === cat ? activeColor : inactiveColor
      }`}
    >
      {icons[cat]} {cat}
    </Button>
  );
})}
        </div>

        {editMode ? (
          <>
            <h2 className="font-semibold mb-2 text-green-700">
              {selectedCategory === "전체" ? "전체" : selectedCategory} 문제
              목록
            </h2>
            <ul className="border rounded p-3 max-h-48 overflow-y-auto bg-white/70 mb-4">
              {/* filteredQuizData 사용 */}
              {filteredQuizData.map((q) => (
                <li
                  key={q.id}
                  className="flex justify-between items-center py-1"
                >
                  <span
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleSelectEdit(q.id)}
                  >
                    {q.question}
                  </span>
                  {/* 삭제 버튼으로 변경 및 setDeletingId 호출 */}
                  <button
  onClick={() => setDeletingId(q.id)}
  className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition"
  title="삭제"
>
  <Trash size={16} strokeWidth={2} />
</button>
                </li>
              ))}
            </ul>

            {/* 수정 폼과 추가 폼을 분리 */}
            {editingId ? (
              // --- 수정 폼 ---
              <div className="mt-6 space-y-2 border p-4 rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold text-green-700 mb-2">
                  문제 수정
                </h2>
                <select
                  value={editData.category}
                  onChange={(e) =>
                    setEditData({ ...editData, category: e.target.value })
                  }
                  className="border border-gray-300 rounded p-2 w-full focus:ring focus:ring-green-200"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="문제 수정"
                  value={editData.question}
                  onChange={(e) =>
                    setEditData({ ...editData, question: e.target.value })
                  }
                />
                <Input
                  placeholder="정답 수정"
                  value={editData.answer}
                  onChange={(e) =>
                    setEditData({ ...editData, answer: e.target.value })
                  }
                />
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  수정 저장
                </Button>
                <Button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-400 hover:bg-gray-500 w-full"
                >
                  수정 취소
                </Button>
              </div>
            ) : (
              // --- 추가 폼 ---
              <div className="mt-6 space-y-2">
                <h2 className="text-lg font-semibold text-green-700">
                  문제 추가
                </h2>
                <select
                  value={newQuestion.category}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, category: e.target.value })
                  }
                  className="border border-gray-300 rounded p-2 w-full focus:ring focus:ring-green-200"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="문제 입력"
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question: e.target.value })
                  }
                />
                <Input
                  placeholder="정답 입력"
                  value={newQuestion.answer}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, answer: e.target.value })
                  }
                />
                <Button
                  onClick={handleAddQuestion}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  문제 추가
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 문제가 없을 경우 메시지 표시 */}
            {filteredQuizData.length > 0 ? (
              <>
                <p className="text-gray-800 font-medium mb-4 leading-relaxed">
                  {current.question}
                </p>
                <Input
                  placeholder="답변 입력..."
                  value={answers[current.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
                  onEnter={(val) => handleNext(true, val)}  // ✅ 최신 입력값 전달
                  className="mb-4"
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

                {/* ✅ 2단 구조 버튼 영역 */}
<div className="flex flex-col gap-3 mb-3">
  {/* 1단: 정답 제출 버튼 (크게) */}
  <Button
    onClick={() => handleNext(true)}
    className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-bold shadow-md active:scale-95 transition"
  >
    ✅ 정답 제출
  </Button>

  {/* 2단: 이전 / 다음 버튼 (작게, 가로 정렬) */}
  <div className="flex gap-2">
    <Button
      onClick={handlePrev}
      className="flex-1 bg-gray-500 hover:bg-gray-600 py-2 text-sm shadow-sm"
    >
      ⬅ 이전 문제
    </Button>
    <Button
      onClick={() => handleNext(false)}
      className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 text-sm shadow-sm"
    >
      다음 문제 ➡
    </Button>
  </div>
</div>

                <div className="mt-4 text-center text-sm text-gray-500">
                  {/* filteredQuizData.length 사용 */}
                  {step + 1} / {filteredQuizData.length} 문제
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-10">
                {selectedCategory === "전체"
                  ? "문제가 없습니다. '문제 추가/수정' 모드에서 문제를 추가해주세요."
                  : `'${selectedCategory}' 카테고리에 문제가 없습니다.`}
              </p>
            )}

            {bookmarked.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  ⭐ 다시 볼 문제
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {bookmarked.map((id) => {
                    const q = quizData.find((q) => q.id === id);
                    // 클릭 시 이동할 step을 filteredQuizData 기준으로 찾기
                    const filteredIndex = filteredQuizData.findIndex(
                      (fq) => fq.id === id
                    );

                    // 북마크된 문제가 현재 필터에 없으면 표시하지 않거나 클릭 비활성화
                    if (
                      !q ||
                      (selectedCategory !== "전체" &&
                        q.category !== selectedCategory)
                    ) {
                      return null;
                    }

                    return (
                      <li
                        key={id}
                        className="cursor-pointer hover:text-green-700"
                        onClick={() => setStep(filteredIndex)}
                      >
                        {q?.question}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        <Button
          onClick={() => setEditMode(!editMode)}
          className="mt-4 w-full bg-gray-400 hover:bg-gray-500"
        >
          {editMode ? "문제 풀기 모드로" : "문제 추가/수정 모드로"}
        </Button>
      </Card>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out { animation: fade-in-out 1.5s ease-in-out; }

        {/* 3초간 지속되는 완료 팝업 애니메이션 추가 */}
        @keyframes fade-in-out-3s {
          0% { opacity: 0; transform: translateY(-10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out-3s { animation: fade-in-out-3s 3s ease-in-out; }
      `}</style>
    </div>
  );
}