import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface SortingState {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  isPlaying: boolean;
  algorithm: string;
  speed: number;
}

const Index = () => {
  const [state, setState] = useState<SortingState>({
    array: [],
    comparing: [],
    swapping: [],
    sorted: [],
    isPlaying: false,
    algorithm: 'bubble',
    speed: 50
  });

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppedRef = useRef(false);

  // Initialize array on component mount
  useEffect(() => {
    generateNewArray();
  }, []);

  const generateNewArray = () => {
    const newArray = Array.from({ length: 50 }, () => Math.floor(Math.random() * 300) + 10);
    setState(prev => ({
      ...prev,
      array: newArray,
      comparing: [],
      swapping: [],
      sorted: [],
      isPlaying: false
    }));
    isStoppedRef.current = false;
  };

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const updateVisualization = async (
    array: number[],
    comparing: number[] = [],
    swapping: number[] = [],
    sorted: number[] = []
  ) => {
    if (isStoppedRef.current) return false;
    
    setState(prev => ({
      ...prev,
      array: [...array],
      comparing: [...comparing],
      swapping: [...swapping],
      sorted: [...sorted]
    }));
    
    await sleep(state.speed);
    return !isStoppedRef.current;
  };

  // Bubble Sort Implementation
  const bubbleSort = async () => {
    const arr = [...state.array];
    const n = arr.length;
    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (isStoppedRef.current) return;
        
        const shouldContinue = await updateVisualization(arr, [j, j + 1], [], sortedIndices);
        if (!shouldContinue) return;

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          const shouldContinue = await updateVisualization(arr, [], [j, j + 1], sortedIndices);
          if (!shouldContinue) return;
        }
      }
      sortedIndices.push(n - 1 - i);
    }
    sortedIndices.push(0);
    await updateVisualization(arr, [], [], sortedIndices);
  };

  // Selection Sort Implementation
  const selectionSort = async () => {
    const arr = [...state.array];
    const n = arr.length;
    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      
      for (let j = i + 1; j < n; j++) {
        if (isStoppedRef.current) return;
        
        const shouldContinue = await updateVisualization(arr, [minIdx, j], [], sortedIndices);
        if (!shouldContinue) return;

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        const shouldContinue = await updateVisualization(arr, [], [i, minIdx], sortedIndices);
        if (!shouldContinue) return;
      }
      
      sortedIndices.push(i);
    }
    sortedIndices.push(n - 1);
    await updateVisualization(arr, [], [], sortedIndices);
  };

  // Insertion Sort Implementation
  const insertionSort = async () => {
    const arr = [...state.array];
    const n = arr.length;
    const sortedIndices: number[] = [0];

    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;

      while (j >= 0) {
        if (isStoppedRef.current) return;
        
        const shouldContinue = await updateVisualization(arr, [j, j + 1], [], sortedIndices);
        if (!shouldContinue) return;

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          const shouldContinue = await updateVisualization(arr, [], [j, j + 1], sortedIndices);
          if (!shouldContinue) return;
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      sortedIndices.push(i);
    }
    await updateVisualization(arr, [], [], Array.from({ length: n }, (_, i) => i));
  };

  // Merge Sort Implementation
  const mergeSort = async () => {
    const arr = [...state.array];
    await mergeSortHelper(arr, 0, arr.length - 1, []);
    await updateVisualization(arr, [], [], Array.from({ length: arr.length }, (_, i) => i));
  };

  const mergeSortHelper = async (arr: number[], left: number, right: number, sorted: number[]) => {
    if (left < right && !isStoppedRef.current) {
      const mid = Math.floor((left + right) / 2);
      
      await mergeSortHelper(arr, left, mid, sorted);
      await mergeSortHelper(arr, mid + 1, right, sorted);
      await merge(arr, left, mid, right, sorted);
    }
  };

  const merge = async (arr: number[], left: number, mid: number, right: number, sorted: number[]) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      if (isStoppedRef.current) return;
      
      const shouldContinue = await updateVisualization(arr, [left + i, mid + 1 + j], [], sorted);
      if (!shouldContinue) return;

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      if (isStoppedRef.current) return;
      arr[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      if (isStoppedRef.current) return;
      arr[k] = rightArr[j];
      j++;
      k++;
    }

    const shouldContinue = await updateVisualization(arr, [], [], sorted);
    if (!shouldContinue) return;
  };

  // Quick Sort Implementation
  const quickSort = async () => {
    const arr = [...state.array];
    await quickSortHelper(arr, 0, arr.length - 1, []);
    await updateVisualization(arr, [], [], Array.from({ length: arr.length }, (_, i) => i));
  };

  const quickSortHelper = async (arr: number[], low: number, high: number, sorted: number[]) => {
    if (low < high && !isStoppedRef.current) {
      const pi = await partition(arr, low, high, sorted);
      if (pi !== -1) {
        await quickSortHelper(arr, low, pi - 1, sorted);
        await quickSortHelper(arr, pi + 1, high, sorted);
      }
    }
  };

  const partition = async (arr: number[], low: number, high: number, sorted: number[]) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (isStoppedRef.current) return -1;
      
      const shouldContinue = await updateVisualization(arr, [j, high], [], sorted);
      if (!shouldContinue) return -1;

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const shouldContinue = await updateVisualization(arr, [], [i, j], sorted);
        if (!shouldContinue) return -1;
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const shouldContinue = await updateVisualization(arr, [], [i + 1, high], sorted);
    if (!shouldContinue) return -1;
    
    return i + 1;
  };

  const startSorting = async () => {
    if (state.isPlaying) {
      isStoppedRef.current = true;
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    setState(prev => ({ ...prev, isPlaying: true }));
    isStoppedRef.current = false;

    switch (state.algorithm) {
      case 'bubble':
        await bubbleSort();
        break;
      case 'selection':
        await selectionSort();
        break;
      case 'insertion':
        await insertionSort();
        break;
      case 'merge':
        await mergeSort();
        break;
      case 'quick':
        await quickSort();
        break;
    }

    setState(prev => ({ ...prev, isPlaying: false }));
  };

  const getBarColor = (index: number) => {
    if (state.sorted.includes(index)) return 'bg-green-500';
    if (state.swapping.includes(index)) return 'bg-red-500';
    if (state.comparing.includes(index)) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const algorithmNames = {
    bubble: 'Bubble Sort',
    selection: 'Selection Sort',
    insertion: 'Insertion Sort',
    merge: 'Merge Sort',
    quick: 'Quick Sort'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sorting Algorithm Visualizer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Watch sorting algorithms come to life through interactive visualizations
          </p>
        </div>

        <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Algorithm:</label>
              <Select
                value={state.algorithm}
                onValueChange={(value) => setState(prev => ({ ...prev, algorithm: value }))}
                disabled={state.isPlaying}
              >
                <SelectTrigger className="w-40 bg-black/30 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {Object.entries(algorithmNames).map(([key, name]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Speed:</label>
              <div className="w-32">
                <Slider
                  value={[101 - state.speed]}
                  onValueChange={([value]) => setState(prev => ({ ...prev, speed: 101 - value }))}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full [&_.slider-track]:bg-white [&_.slider-range]:bg-slate-800 [&_.slider-thumb]:bg-slate-800 [&_.slider-thumb]:border-white"
                  disabled={state.isPlaying}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={startSorting}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                {state.isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {state.isPlaying ? 'Stop' : 'Start'}
              </Button>

              <Button
                onClick={() => {
                  isStoppedRef.current = true;
                  setState(prev => ({
                    ...prev,
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    isPlaying: false
                  }));
                }}
                disabled={state.isPlaying}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={generateNewArray}
                disabled={state.isPlaying}
                className="bg-purple-500 hover:bg-purple-600 text-white border-0"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-black/10 backdrop-blur-xl border-white/10 p-6">
          <div className="flex items-end justify-center gap-1 h-80 overflow-hidden">
            {state.array.map((value, index) => (
              <div
                key={index}
                className={`transition-all duration-300 rounded-t-sm ${getBarColor(index)} opacity-90 hover:opacity-100`}
                style={{
                  height: `${(value / 300) * 100}%`,
                  width: `${Math.max(800 / state.array.length, 2)}px`,
                  minWidth: '2px'
                }}
                title={`Value: ${value}, Index: ${index}`}
              />
            ))}
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-white">Unsorted</span>
            </div>
          </Card>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-white">Comparing</span>
            </div>
          </Card>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-white">Swapping</span>
            </div>
          </Card>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-white">Sorted</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
