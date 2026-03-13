/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AlgorithmType {
  DESCRIPTIVE = '描述性統計',
  INFERENTIAL_PARAMETRIC = '推論性統計 (參數)',
  INFERENTIAL_NON_PARAMETRIC = '推論性統計 (非參數)',
  REGRESSION = '迴歸分析',
  SURVIVAL = '存活分析',
  MACHINE_LEARNING = '機器學習',
  BAYESIAN = '貝氏統計',
  DIAGNOSTIC = '診斷試驗分析',
  META_ANALYSIS = 'Meta 分析 (薈萃分析)',
  TIME_SERIES = '時間序列分析',
  CAUSAL_INFERENCE = '因果推論',
  MULTIVARIATE = '多變量分析'
}

export interface Algorithm {
  id: string;
  name: string;
  type: AlgorithmType;
  description: string;
  pros: string[];
  cons: string[];
  suitability: string;
}

export interface ProjectDetails {
  title: string;
  description: string;
  goal: string;
  dataType: string;
  sampleSize: string;
  studyDesign: string;
}

export interface SimulationResult {
  algorithmId: string;
  power: number; // 0-1
  precision: number; // 0-1
  complexity: number; // 0-1
  recommendationScore: number; // 0-100
  notes: string;
}

export interface ValidationWarning {
  type: 'error' | 'warning';
  message: string;
  affectedAlgorithms: string[];
}

export const AVAILABLE_ALGORITHMS: Algorithm[] = [
  // Parametric
  {
    id: 't-test',
    name: 'T-檢定 (T-Test)',
    type: AlgorithmType.INFERENTIAL_PARAMETRIC,
    description: '比較兩組平均值是否有顯著差異。',
    pros: ['簡單易懂', '計算快速'],
    cons: ['需符合常態分佈', '僅限兩組比較'],
    suitability: '適用於小樣本、兩組獨立或成對樣本的均值比較。'
  },
  {
    id: 'paired-t-test',
    name: '配對 T-檢定 (Paired T-Test)',
    type: AlgorithmType.INFERENTIAL_PARAMETRIC,
    description: '比較同一組受試者在不同時間點或條件下的平均值差異。',
    pros: ['消除個體差異', '檢定力較高'],
    cons: ['需符合差值常態分佈'],
    suitability: '適用於臨床試驗中的前後測比較。'
  },
  {
    id: 'anova',
    name: '變異數分析 (ANOVA)',
    type: AlgorithmType.INFERENTIAL_PARAMETRIC,
    description: '比較三組或以上平均值是否有顯著差異。',
    pros: ['可處理多組比較', '減少型一錯誤'],
    cons: ['事後比較較複雜', '需符合變異數同質性'],
    suitability: '適用於三組以上類別變項對連續變項的影響分析。'
  },
  // Non-Parametric
  {
    id: 'chi-square',
    name: '卡方檢定 (Chi-Square Test)',
    type: AlgorithmType.INFERENTIAL_NON_PARAMETRIC,
    description: '檢驗兩個類別變項之間是否具有相關性。',
    pros: ['適用於類別數據', '不需分佈假設'],
    cons: ['樣本量太小時不準確'],
    suitability: '分析性別與患病率、治療組別與有效率的關係。'
  },
  {
    id: 'fisher-exact',
    name: 'Fisher 精確檢定 (Fisher\'s Exact Test)',
    type: AlgorithmType.INFERENTIAL_NON_PARAMETRIC,
    description: '卡方檢定的精確版本，適用於小樣本。',
    pros: ['小樣本下極其準確'],
    cons: ['計算量隨樣本增加而劇增'],
    suitability: '當列聯表中期望值小於 5 時使用。'
  },
  {
    id: 'mann-whitney',
    name: 'Mann-Whitney U 檢定',
    type: AlgorithmType.INFERENTIAL_NON_PARAMETRIC,
    description: 'T-檢定的非參數替代方法，比較兩組中位數。',
    pros: ['不需常態分佈假設', '對極端值不敏感'],
    cons: ['檢定力略低於 T-檢定'],
    suitability: '當數據不符合常態分佈或為序位數據時使用。'
  },
  {
    id: 'kruskal-wallis',
    name: 'Kruskal-Wallis 檢定',
    type: AlgorithmType.INFERENTIAL_NON_PARAMETRIC,
    description: 'ANOVA 的非參數替代方法。',
    pros: ['適用於非常態分佈', '可處理多組比較'],
    cons: ['無法直接進行事後兩兩比較'],
    suitability: '多組獨立樣本的中位數比較。'
  },
  // Regression
  {
    id: 'linear-regression',
    name: '線性迴歸 (Linear Regression)',
    type: AlgorithmType.REGRESSION,
    description: '探討自變項與連續型依變項之間的線性關係。',
    pros: ['模型簡單', '解釋性強'],
    cons: ['需符合線性、常態、同方差假設'],
    suitability: '預測數值型結果。'
  },
  {
    id: 'logistic-regression',
    name: '邏輯斯迴歸 (Logistic Regression)',
    type: AlgorithmType.REGRESSION,
    description: '預測二元結果（如：患病/未患病）的機率。',
    pros: ['結果易於解釋 (OR值)', '不需常態分佈假設'],
    cons: ['易受共線性影響', '需較大樣本量'],
    suitability: '醫學研究中最常用於預測疾病發生風險的工具。'
  },
  {
    id: 'poisson-regression',
    name: '卜瓦松迴歸 (Poisson Regression)',
    type: AlgorithmType.REGRESSION,
    description: '處理計數型數據（離散型數據，如發生次數）。',
    pros: ['專門處理計數資料', '可分析發生率'],
    cons: ['需符合平均數等於變異數的假設'],
    suitability: '適用於分析一段時間內事件發生的次數。'
  },
  {
    id: 'negative-binomial',
    name: '負二項迴歸 (Negative Binomial Regression)',
    type: AlgorithmType.REGRESSION,
    description: '卜瓦松迴歸的擴充，處理過度分散 (Overdispersion) 的計數數據。',
    pros: ['比卜瓦松迴歸更具彈性'],
    cons: ['模型較複雜'],
    suitability: '當計數數據的變異數遠大於平均數時。'
  },
  // Multi-level / Repeated Measures
  {
    id: 'gee',
    name: '廣義估計方程式 (GEE)',
    type: AlgorithmType.REGRESSION,
    description: '處理重複測量或群聚數據的群體平均模型。',
    pros: ['對相關結構的假設較寬鬆'],
    cons: ['不適用於個體預測'],
    suitability: '追蹤研究中分析群體趨勢。'
  },
  {
    id: 'lmm',
    name: '線性混合效應模型 (LMM)',
    type: AlgorithmType.REGRESSION,
    description: '處理具有固定效應與隨機效應的層次數據。',
    pros: ['可處理缺失值', '可進行個體預測'],
    cons: ['模型設定複雜'],
    suitability: '多中心研究或具有個體差異的重複測量數據。'
  },
  // Survival
  {
    id: 'cox-regression',
    name: 'Cox 比例風險模型 (Cox Regression)',
    type: AlgorithmType.SURVIVAL,
    description: '分析時間至事件發生（存活時間）的影響因素。',
    pros: ['可處理設限資料', '可同時分析多個因素'],
    cons: ['需符合比例風險假設'],
    suitability: '癌症研究、追蹤研究中分析存活率的首選。'
  },
  {
    id: 'competing-risk',
    name: '競爭風險模型 (Fine-Gray Model)',
    type: AlgorithmType.SURVIVAL,
    description: '處理存在競爭事件（如：死於其他原因）時的存活分析。',
    pros: ['避免過度估計風險'],
    cons: ['結果解釋較不直觀'],
    suitability: '當研究對象可能因為非研究感興趣的死因而無法觀察到目標事件時。'
  },
  {
    id: 'kaplan-meier',
    name: 'Kaplan-Meier 曲線',
    type: AlgorithmType.SURVIVAL,
    description: '估計存活函數的非參數方法。',
    pros: ['視覺化直觀', '不需分佈假設'],
    cons: ['無法調整共變量'],
    suitability: '初步觀察兩組存活率差異時使用。'
  },
  // Causal Inference
  {
    id: 'psm',
    name: '傾向評分匹配 (PSM)',
    type: AlgorithmType.REGRESSION,
    description: '模擬隨機對照試驗，減少觀察性研究中的選擇偏倚。',
    pros: ['提高組間可比性'],
    cons: ['僅能處理已知的共變量'],
    suitability: '非隨機臨床研究中平衡兩組基線特徵。'
  },
  // Diagnostic
  {
    id: 'roc-curve',
    name: 'ROC 曲線分析',
    type: AlgorithmType.DIAGNOSTIC,
    description: '評估診斷工具的準確性（靈敏度與特異度）。',
    pros: ['提供 AUC 值', '可尋找最佳切點'],
    cons: ['不考慮疾病盛行率'],
    suitability: '開發新型檢驗試劑或診斷標準時必備。'
  },
  {
    id: 'dca',
    name: '決策曲線分析 (DCA)',
    type: AlgorithmType.DIAGNOSTIC,
    description: '評估預測模型在臨床應用中的淨獲益。',
    pros: ['考慮臨床後果', '比 ROC 更具臨床意義'],
    cons: ['需設定閾值範圍'],
    suitability: '評估模型是否值得在臨床實踐中推廣。'
  },
  // Machine Learning
  {
    id: 'lasso-ridge',
    name: 'Lasso / Ridge 迴歸',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '具備正則化功能的迴歸方法，用於特徵篩選與防止過擬合。',
    pros: ['自動篩選變項', '提高模型穩定性'],
    cons: ['係數解釋受縮減影響'],
    suitability: '當自變項過多或存在嚴重共線性時。'
  },
  {
    id: 'random-forest',
    name: '隨機森林 (Random Forest)',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '利用多棵決策樹進行預測與分類。',
    pros: ['準確度高', '可處理高維度數據', '具備特徵重要性評估'],
    cons: ['黑盒子模型，解釋性較差', '計算資源需求較大'],
    suitability: '適用於複雜疾病預測、基因數據分析。'
  },
  {
    id: 'xgboost',
    name: 'XGBoost',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '高效的梯度提升決策樹演算法。',
    pros: ['極高的預測準確度', '處理缺失值能力強'],
    cons: ['參數調優複雜', '易過擬合'],
    suitability: '大數據競賽與臨床預測模型開發。'
  },
  {
    id: 'svm',
    name: '支持向量機 (SVM)',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '尋找最佳超平面進行分類。',
    pros: ['適用於小樣本高維數據'],
    cons: ['對核函數選擇敏感'],
    suitability: '影像診斷、生物資訊學分類。'
  },
  {
    id: 'neural-network',
    name: '人工神經網路 (ANN)',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '模擬生物神經系統的複雜非線性模型。',
    pros: ['處理極其複雜的關係'],
    cons: ['需要大量數據', '解釋性極低'],
    suitability: '深度學習、醫學影像識別。'
  },
  // Bayesian
  {
    id: 'bayesian-linear',
    name: '貝氏線性模型',
    type: AlgorithmType.BAYESIAN,
    description: '利用先驗機率與數據更新後驗機率的統計方法。',
    pros: ['可整合專家經驗', '提供機率性解釋'],
    cons: ['計算成本高', '先驗分佈設定具主觀性'],
    suitability: '當樣本量極小或有強大背景知識時。'
  },
  // Meta Analysis
  {
    id: 'meta-fixed',
    name: '固定效應 Meta 分析',
    type: AlgorithmType.META_ANALYSIS,
    description: '整合多項研究結果，假設所有研究探討的是同一個真實效應。',
    pros: ['統計效力強'],
    cons: ['不允許研究間存在異質性'],
    suitability: '當納入的研究設計與人群高度一致時。'
  },
  {
    id: 'meta-random',
    name: '隨機效應 Meta 分析',
    type: AlgorithmType.META_ANALYSIS,
    description: '考慮研究間異質性的整合分析方法。',
    pros: ['結果更具推廣性', '容許異質性'],
    cons: ['小樣本研究權重可能過大'],
    suitability: '醫學 Meta 分析中最常用的標準方法。'
  },
  {
    id: 'network-meta',
    name: '網狀 Meta 分析 (NMA)',
    type: AlgorithmType.META_ANALYSIS,
    description: '同時比較多種治療方案，包含間接比較。',
    pros: ['可比較未曾直接對決的藥物'],
    cons: ['需符合一致性假設'],
    suitability: '當市場上存在多種同類藥物需要排序優劣時。'
  },
  // Multivariate
  {
    id: 'pca',
    name: '主成分分析 (PCA)',
    type: AlgorithmType.MULTIVARIATE,
    description: '將多個相關變項轉化為少數不相關的主成分。',
    pros: ['數據降維', '消除共線性'],
    cons: ['主成分解釋較困難'],
    suitability: '基因組學或多指標臨床評估。'
  },
  {
    id: 'sem',
    name: '結構方程模型 (SEM)',
    type: AlgorithmType.MULTIVARIATE,
    description: '分析多個自變項與依變項之間的複雜路徑關係。',
    pros: ['可處理潛在變項', '可分析路徑影響'],
    cons: ['需要大樣本', '模型擬合要求高'],
    suitability: '心理健康研究或複雜致病機轉分析。'
  },
  // Advanced Regression
  {
    id: 'zero-inflated',
    name: '零膨脹模型 (Zero-inflated)',
    type: AlgorithmType.REGRESSION,
    description: '處理包含大量零值的計數數據。',
    pros: ['解決過多零值導致的偏差'],
    cons: ['模型解釋較複雜'],
    suitability: '分析罕見副作用發生次數或急診就醫次數。'
  },
  {
    id: 'quantile-regression',
    name: '分位數迴歸 (Quantile Regression)',
    type: AlgorithmType.REGRESSION,
    description: '分析自變項對依變項不同分位數（如第 90 百分位）的影響。',
    pros: ['對極端值穩健', '提供全貌分析'],
    cons: ['計算量較大'],
    suitability: '分析肥胖人群中極端體重的影響因素。'
  },
  // Time Series
  {
    id: 'arima',
    name: 'ARIMA 模型',
    type: AlgorithmType.TIME_SERIES,
    description: '經典的時間序列預測模型。',
    pros: ['適用於短期預測', '捕捉季節性'],
    cons: ['需數據平穩', '難以處理非線性'],
    suitability: '預測傳染病流行趨勢或醫院門診量。'
  },
  // Advanced ML
  {
    id: 'lightgbm',
    name: 'LightGBM',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '基於直方圖的梯度提升框架。',
    pros: ['訓練速度極快', '內存佔用低'],
    cons: ['易過擬合'],
    suitability: '處理大規模電子病歷數據。'
  },
  {
    id: 'catboost',
    name: 'CatBoost',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '專門優化類別型特徵的提升演算法。',
    pros: ['不需預處理類別變項', '準確度高'],
    cons: ['預測速度較慢'],
    suitability: '包含大量類別變項（如醫院 ID、地區）的臨床數據。'
  },
  {
    id: 'autoencoder',
    name: '自動編碼器 (AutoEncoder)',
    type: AlgorithmType.MACHINE_LEARNING,
    description: '用於特徵提取或異常檢測的神經網路。',
    pros: ['無監督學習', '發現隱藏特徵'],
    cons: ['需要大量數據'],
    suitability: '醫學影像異常檢測或多組學數據整合。'
  },
  // Causal
  {
    id: 'iv-regression',
    name: '工具變數迴歸 (IV)',
    type: AlgorithmType.CAUSAL_INFERENCE,
    description: '利用工具變數解決內生性問題。',
    pros: ['可推導因果關係'],
    cons: ['難以找到完美的工具變數'],
    suitability: '觀察性研究中排除未觀測到的混雜因素。'
  },
  {
    id: 'mendelian-randomization',
    name: '孟德爾隨機化 (MR)',
    type: AlgorithmType.CAUSAL_INFERENCE,
    description: '利用基因變異作為工具變數進行因果推論。',
    pros: ['避免反向因果', '減少混雜偏倚'],
    cons: ['需符合強大的遺傳假設'],
    suitability: '利用 GWAS 數據分析生活習慣與疾病的因果。'
  }
];
