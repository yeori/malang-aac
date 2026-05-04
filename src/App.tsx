import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Volume2, 
  X, 
  Menu, 
  LayoutGrid, 
  Type, 
  ChevronRight,
  Home,
  MessageCircle,
  Utensils,
  Smile,
  MapPin,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface SymbolItem {
  id: string;
  label: string;
  category: 'people' | 'actions' | 'descriptions' | 'objects' | 'social';
  icon: React.ReactNode;
  color: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface Board {
  id: string;
  name: string;
  description: string;
}

// --- Constants & Data ---
const CATEGORIES: Category[] = [
  { id: 'all', name: '전체', icon: <Home className="w-5 h-5" />, color: 'bg-gray-100' },
  { id: 'social', name: '인사/기분', icon: <Smile className="w-5 h-5" />, color: 'bg-pink-100' },
  { id: 'people', name: '사람', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-yellow-100' },
  { id: 'actions', name: '행동', icon: <PlayCircle className="w-5 h-5" />, color: 'bg-green-100' },
  { id: 'objects', name: '물건/음식', icon: <Utensils className="w-5 h-5" />, color: 'bg-orange-100' },
  { id: 'places', name: '장소', icon: <MapPin className="w-5 h-5" />, color: 'bg-blue-100' },
];

const INITIAL_SYMBOLS: SymbolItem[] = [
  // Social
  { id: 's1', label: '안녕하세요', category: 'social', color: '', icon: <Smile /> },
  { id: 's2', label: '좋아요', category: 'social', color: '', icon: <Smile /> },
  { id: 's3', label: '싫어요', category: 'social', color: '', icon: <Smile className="rotate-180" /> },
  // People
  { id: 'p1', label: '나', category: 'people', color: '', icon: <MessageCircle /> },
  { id: 'p2', label: '엄마', category: 'people', color: '', icon: <MessageCircle /> },
  { id: 'p3', label: '아빠', category: 'people', color: '', icon: <MessageCircle /> },
  { id: 'p4', label: '선생님', category: 'people', color: '', icon: <MessageCircle /> },
  // Actions
  { id: 'a1', label: '먹다', category: 'actions', color: '', icon: <Utensils /> },
  { id: 'a2', label: '마시다', category: 'actions', color: '', icon: <Volume2 /> },
  { id: 'a3', label: '가다', category: 'actions', color: '', icon: <ChevronRight /> },
  { id: 'a4', label: '놀다', category: 'actions', color: '', icon: <Plus /> },
  // Objects
  { id: 'o1', label: '물', category: 'objects', color: '', icon: <Utensils /> },
  { id: 'o2', label: '밥', category: 'objects', color: '', icon: <Utensils /> },
  { id: 'o3', label: '빵', category: 'objects', color: '', icon: <Utensils /> },
  { id: 'o4', label: '책', category: 'objects', color: '', icon: <Type /> },
];

const INITIAL_BOARDS: Board[] = [
  { id: 'b1', name: '일상 대화', description: '기본적인 대화를 나눌 수 있는 의사소통판' },
  { id: 'b2', name: '학교 생활', description: '학교에서 선생님, 친구들과 대화' },
  { id: 'b3', name: '식당에서', description: '음식을 주문하거나 식사할 때' },
  { id: 'b4', name: '나의 감정', description: '내 기분과 감정을 표현할 때' },
  { id: 'b5', name: '놀이터', description: '친구들과 놀이터에서 놀 때' },
];

type ColumnMode = '2' | '3' | '4' | '5' | '6' | 'auto';

const COLUMN_OPTIONS: { value: ColumnMode; label: string }[] = [
  { value: '2', label: '2열' },
  { value: '3', label: '3열' },
  { value: '4', label: '4열' },
  { value: '5', label: '5열' },
  { value: '6', label: '6열' },
  { value: 'auto', label: '자동' },
];

export default function App() {
  const [columnMode, setColumnMode] = useState<ColumnMode>('auto');
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [isSentenceMode, setIsSentenceMode] = useState(false);
  const [sentence, setSentence] = useState<SymbolItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState('b1');
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');

  // --- Logic ---
  const filteredSymbols = useMemo(() => {
    if (activeCategory === 'all') return INITIAL_SYMBOLS;
    return INITIAL_SYMBOLS.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const addSymbol = (symbol: SymbolItem) => {
    if (isSentenceMode) {
      setSentence(prev => [...prev, symbol]);
    } else {
      speak(symbol.label);
    }
  };

  const clearSentence = () => setSentence([]);
  
  const readSentence = () => {
    const text = sentence.map(s => s.label).join(' ');
    speak(text);
  };

  const handleAddBoard = () => {
    if (!newBoardName.trim()) return;
    const newBoard: Board = {
      id: `b${Date.now()}`,
      name: newBoardName.trim(),
      description: newBoardDescription.trim(),
    };
    setBoards(prev => [...prev, newBoard]);
    setIsAddBoardModalOpen(false);
    setNewBoardName('');
    setNewBoardDescription('');
    setActiveBoardId(newBoard.id);
    setIsMenuOpen(false);
  };

  const getGridColsClass = () => {
    if (columnMode === 'auto') {
      return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6';
    }
    return `grid-cols-${columnMode}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* --- Top Navbar --- */}
      <header className={`bg-white border-b border-gray-100 shadow-sm z-30 transition-all duration-300 flex items-center ${isSentenceMode ? 'min-h-[88px] py-3' : 'h-16'}`}>
        <div className="px-4 w-full flex items-center justify-between gap-4">
          {isSentenceMode ? (
            <div className="flex-1 flex w-full gap-4 relative justify-between">
              <div className="flex-1 flex flex-wrap gap-2 items-center bg-gray-50 rounded-2xl p-2 min-h-[64px] border-2 border-dashed border-gray-200 overflow-y-auto max-h-[120px]">
                {sentence.length === 0 && (
                  <span className="text-gray-400 text-sm italic ml-2">상징을 선택하여 문장을 만들어보세요...</span>
                )}
                <AnimatePresence>
                  {sentence.map((s, idx) => (
                    <motion.div 
                      key={`${s.id}-${idx}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex flex-col items-center p-1 bg-white rounded-lg shadow-sm border border-gray-200 min-w-[50px] relative shrink-0"
                    >
                      <div className="p-1.5 rounded-md flex items-center justify-center">
                        {React.cloneElement(s.icon as React.ReactElement, { size: 24, className: "text-gray-600" })}
                      </div>
                      {showLabels && <span className="text-[10px] mt-0.5 font-bold text-gray-800">{s.label}</span>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={readSentence}
                  disabled={sentence.length === 0}
                  className="p-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 active:scale-95 transition-all disabled:opacity-30"
                  title="문장 읽기"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={clearSentence}
                  disabled={sentence.length === 0}
                  className="p-3 bg-gray-200 text-gray-600 rounded-full shadow-sm hover:bg-gray-300 active:scale-95 transition-all disabled:opacity-30"
                  title="초기화"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="h-8 w-px bg-gray-200 mx-1"></div>
                <button 
                  onClick={() => {
                    setIsSentenceMode(false);
                    clearSentence();
                  }}
                  className="p-3 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 active:scale-95 transition-all"
                  title="닫기"
                  id="sentence-mode-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
                  id="menu-btn"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                  <span>말랑말랑 AAC</span>
                  {boards.find(b => b.id === activeBoardId) && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-sm font-medium hidden sm:block">
                        {boards.find(b => b.id === activeBoardId)?.name}
                      </span>
                    </>
                  )}
                </h1>
              </div>

              <div className="flex items-center gap-2 relative">
                {/* Feature C: Column Control */}
                <div className="relative">
                  <button 
                    onClick={() => setIsColMenuOpen(!isColMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all active:scale-95 font-medium text-sm"
                    id="col-adjust-btn"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {columnMode === 'auto' ? '자동' : `${columnMode}열`} 조정
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isColMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsColMenuOpen(false)}></div>
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50 w-32 flex flex-col gap-1"
                        >
                          {COLUMN_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setColumnMode(opt.value);
                                setIsColMenuOpen(false);
                              }}
                              className={`px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors ${columnMode === opt.value ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Feature B: Label Toggle */}
                <button 
                  onClick={() => setShowLabels(!showLabels)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 font-medium text-sm ${showLabels ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}
                  id="label-toggle-btn"
                >
                  <Type className="w-4 h-4" />
                  <span className="hidden sm:inline">{showLabels ? '이름 끄기' : '이름 켜기'}</span>
                </button>

                {/* Feature A Toggle: Sentence Builder */}
                <button 
                  onClick={() => setIsSentenceMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 font-bold shadow-sm bg-gray-800 text-white"
                  id="sentence-mode-btn"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">문장 만들기</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* --- Category Tabs (Additional Idea) --- */}
        <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100/50">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all active:scale-95 font-medium ${activeCategory === cat.id ? 'bg-white shadow-md text-gray-900 border border-gray-200' : 'text-gray-500 border border-transparent'}`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* --- Symbols Grid --- */}
        <div className="flex-1 p-4 overflow-y-auto w-full max-w-7xl mx-auto">
          <motion.div 
            layout
            className={`grid gap-4 ${getGridColsClass()}`}
            style={
              columnMode !== 'auto' 
                ? { gridTemplateColumns: `repeat(${columnMode}, minmax(0, 1fr))` } 
                : {}
            }
          >
            <AnimatePresence mode="popLayout">
              {filteredSymbols.map(symbol => (
                <motion.div
                  layout
                  key={symbol.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => addSymbol(symbol)}
                  className="relative inline-block w-full cursor-pointer z-10 select-none group"
                  id={`symbol-${symbol.id}`}
                >
                  <div className="relative block w-full h-auto aspect-square overflow-hidden bg-white z-0 rounded-2xl shadow-sm border border-gray-200 group-hover:shadow-md transition-all">
                    <div className="w-full h-full flex items-center justify-center p-4">
                      {React.cloneElement(symbol.icon as React.ReactElement, { 
                        size: '50%',
                        className: "text-gray-600"
                      })}
                    </div>
                  </div>
                  
                  {showLabels && (
                    <div className="absolute text-center z-10 bottom-3 w-full left-1/2 -translate-x-1/2 pointer-events-none">
                      <span className="font-bold bg-white text-gray-800 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(88,88,88,0.3)] text-xs sm:text-sm whitespace-nowrap">
                        {symbol.label}
                      </span>
                    </div>
                  )}

                  {/* Feedback effect on tap */}
                  <motion.div 
                    whileTap={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gray-200/50 rounded-2xl opacity-0 pointer-events-none"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* --- Feature D: Board Menu --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800">의사소통판</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {boards.map((board) => (
                  <button 
                    key={board.id}
                    className={`w-full flex flex-col gap-1 p-4 rounded-2xl text-left transition-all ${activeBoardId === board.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                    onClick={() => {
                      setActiveBoardId(board.id);
                      setIsMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="w-5 h-5 opacity-50 shrink-0" />
                      <span className="truncate">{board.name}</span>
                    </div>
                    {board.description && (
                      <span className={`text-xs pl-8 truncate ${activeBoardId === board.id ? 'text-blue-500/80 font-normal' : 'text-gray-400'}`}>
                        {board.description}
                      </span>
                    )}
                  </button>
                ))}
                
                {/* 상황 추가 버튼 */}
                <button
                  onClick={() => setIsAddBoardModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 mt-2 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  새로운 상황 추가
                </button>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
                말랑말랑 AAC v1.0
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Add Board Modal --- */}
      <AnimatePresence>
        {isAddBoardModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsAddBoardModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm relative z-10 p-6 sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">새로운 상황 추가</h3>
                <button 
                  onClick={() => setIsAddBoardModalOpen(false)} 
                  className="p-2 -mr-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">상황 이름 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800"
                    placeholder="예: 놀이공원"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">설명 <span className="text-gray-400 font-normal">(선택)</span></label>
                  <textarea 
                    value={newBoardDescription}
                    onChange={e => setNewBoardDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 resize-none"
                    placeholder="예: 놀이공원 매표소에서"
                    rows={3}
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={handleAddBoard}
                    disabled={!newBoardName.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 active:scale-95 transition-all shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    만들기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
