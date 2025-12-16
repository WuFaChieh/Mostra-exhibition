import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  Sparkles,
  Loader2,
  Send,
  ExternalLink,
  Info,
  Home,
  User as UserIcon,
  Plus,
  LogIn,
  Bookmark,
  Heart,
  Grid,
  Palette,
  Camera,
  Landmark,
  Baby,
  History,
  Share2,
  Tent,
  Coffee,
  BookOpen,
  School,
  Ticket,
  CircleDollarSign,
  Layers,
  X,
  RotateCcw,
  Check,
  ArrowRight,
  List,
  MessageCircle
} from 'lucide-react';
import { Exhibition, User, Notification, ViewState, Comment } from './types';
import { generateCuratorInsight, enhanceExhibitionDraft } from './services/geminiService';
import { StarRating } from './components/StarRating';

// --- 常數設定 ---
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1518998053901-5348d3969105?q=80&w=800&auto=format&fit=crop";
const LOGO_URL = "https://file-s.s3.amazonaws.com/file_s/51a37c4b-449e-4b47-b27b-240833777085";

// --- Logo Component ---
const Logo = ({ className = "w-8 h-8", size = "small" }: { className?: string, size?: "small" | "large" }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`${className} bg-black flex items-center justify-center rounded-lg shadow-sm text-white font-serif font-bold ${size === 'large' ? 'text-4xl' : 'text-xl'}`}>
        M
      </div>
    );
  }

  return (
    <img 
      src={LOGO_URL} 
      alt="Mostra Logo" 
      className={`${className} object-contain`} 
      onError={() => setError(true)}
      crossOrigin="anonymous"
    />
  );
};

// --- 資料庫 ---

// 1. 大型展覽 (Major)
const MAJOR_EXHIBITIONS: Exhibition[] = [
  {
    id: 'e1',
    title: '從拉斐爾到梵谷：英國國家藝廊珍藏展',
    artist: '奇美博物館 Chimei Museum',
    dateRange: '2024/05/02 - 2024/09/01',
    description: '台灣史上最高規格西洋畫展！由奇美博物館與英國國家藝廊共同主辦，匯集波提切利、拉斐爾、提香、卡拉瓦喬、林布蘭、哥雅、透納、塞尚、莫內、雷諾瓦、高更、梵谷等50位大師真跡。',
    location: '台南市 · 奇美博物館',
    category: '博物館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop', 
    tags: ['西洋繪畫', '大師真跡', '必看大展'],
    rating: 4.9,
    sourceUrl: 'https://www.chimeimuseum.org/',
    bookmarksCount: 1240,
    comments: [
      { id: 'c1', userId: 'u2', userName: 'ArtLover_TW', userAvatar: 'https://picsum.photos/id/65/100/100', rating: 5, text: '動線規劃得很好，雖然人多但不至於擁擠。看到梵谷向日葵真跡的時候眼淚都要掉下來了！', date: '2天前' }
    ]
  },
  {
    id: 'e2',
    title: '瞬間－穿越繪畫與攝影之旅',
    artist: '高雄市立美術館',
    dateRange: '2024/06/29 - 2024/11/17',
    description: '與英國泰特美術館（Tate）合作，展出畢卡索、安迪沃荷、大衛霍克尼等大師作品。探討繪畫與攝影之間長達百年的互動關係，捕捉藝術史上的關鍵「瞬間」。',
    location: '高雄市 · 高美館',
    category: '美術館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop', 
    tags: ['當代藝術', '攝影', '泰特美術館'],
    rating: 4.8,
    sourceUrl: 'https://www.kmfa.gov.tw/',
    bookmarksCount: 856,
    comments: []
  },
  {
    id: 'e3',
    title: '達文西體驗展－超越500年的輝煌',
    artist: '華山1914文創園區',
    dateRange: '2024/06/14 - 2024/09/29',
    description: '透過沉浸式光影互動與實體模型，解密文藝復興全能天才達文西的筆記與發明。展覽結合科技與藝術，帶領觀眾走進達文西的異想世界。',
    location: '台北市 · 華山文創園區',
    category: '文創園區',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1597926665727-4a123f6d7874?q=80&w=800&auto=format&fit=crop',
    tags: ['沈浸式體驗', '親子共遊', '文藝復興'],
    rating: 4.5,
    sourceUrl: 'https://www.huashan1914.com/',
    bookmarksCount: 632,
    comments: []
  },
  {
    id: 'e4',
    title: '臺北美術獎 2024',
    artist: '臺北市立美術館',
    dateRange: '2024/05/10 - 2024/08/10',
    description: '台灣當代藝術的重要指標。展出入選藝術家的創新作品，形式涵蓋平面繪畫、立體裝置、錄像藝術等，展現台灣新生代藝術家的充沛能量。',
    location: '台北市 · 北美館',
    category: '美術館',
    type: 'major',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    tags: ['台灣當代', '新銳藝術家', '免費參觀'],
    rating: 4.2,
    sourceUrl: 'https://www.tfam.museum/',
    bookmarksCount: 315,
    comments: []
  },
  {
    id: 'e5',
    title: '真實本質：羅丹與印象派時代',
    artist: '富邦美術館',
    dateRange: '2024/05/04 - 2024/09/23',
    description: '富邦美術館開館大展，與洛杉磯郡立美術館（LACMA）合作，引進羅丹、雷諾瓦、塞尚、莫內等19世紀大師的雕塑與畫作，是近年難得的重磅展覽。',
    location: '台北市 · 富邦美術館',
    category: '美術館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1555581561-c30d92257217?q=80&w=800&auto=format&fit=crop',
    tags: ['雕塑', '印象派', '國際大展'],
    rating: 4.7,
    sourceUrl: 'https://www.fubonart.org.tw/',
    bookmarksCount: 920,
    comments: []
  },
  {
    id: 'e6',
    title: '看得見的秘密：視覺機能的發現之旅',
    artist: '國立自然科學博物館',
    dateRange: '2024/04/15 - 2024/11/10',
    description: '從生物演化的角度探索「視覺」的奧秘。為什麼有些動物看得到紅外線？人類的眼睛又是如何運作的？適合全家大小一起探索的科學展覽。',
    location: '台中市 · 科博館',
    category: '博物館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1535581652167-3d6b98c538a5?q=80&w=800&auto=format&fit=crop',
    tags: ['科普', '生物學', '親子教育'],
    rating: 4.6,
    sourceUrl: 'https://www.nmns.edu.tw/',
    bookmarksCount: 450,
    comments: []
  },
  {
    id: 'e7',
    title: '大美不言',
    artist: '國立故宮博物院',
    dateRange: '2024/09/26 - 2024/12/29',
    description: '故宮與巴黎裝飾藝術博物館及梵克雅寶（Van Cleef & Arpels）合作，展出精緻的珠寶、陶瓷與玉器，呈現東西方工藝美學的極致對話。',
    location: '台北市 · 故宮博物院',
    category: '博物館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1601646272535-6541f5358052?q=80&w=800&auto=format&fit=crop',
    tags: ['珠寶工藝', '故宮', '跨界合作'],
    rating: 4.8,
    sourceUrl: 'https://www.npm.gov.tw/',
    bookmarksCount: 780,
    comments: []
  },
  {
    id: 'e8',
    title: '名偵探柯南 連載30週年紀念展',
    artist: '新光三越 台北信義新天地',
    dateRange: '2024/07/06 - 2024/09/01',
    description: '真相永遠只有一個！柯南連載30週年，展出珍貴手稿、經典案件回顧以及作者青山剛昌的訪談，是動漫迷不可錯過的盛會。',
    location: '台北市 · 信義新天地A11',
    category: '文創園區',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1612404730960-5c71579fca2c?q=80&w=800&auto=format&fit=crop',
    tags: ['動漫', '日本IP', '打卡熱點'],
    rating: 4.4,
    sourceUrl: 'https://www.skm.com.tw/',
    bookmarksCount: 1500,
    comments: []
  },
  {
    id: 'e9',
    title: 'Hello, Human! 人類，你好！',
    artist: '台北當代藝術館 MOCA',
    dateRange: '2024/01/27 - 2024/05/12',
    description: '在AI快速發展的時代，我們如何定義「人類」？MOCA 集結多位國內外藝術家，透過數位藝術與裝置，反思科技與人性的邊界。',
    location: '台北市 · MOCA',
    category: '美術館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    tags: ['AI藝術', '科技倫理', '當代思辨'],
    rating: 4.3,
    sourceUrl: 'https://www.mocataipei.org.tw/',
    bookmarksCount: 340,
    comments: []
  },
  {
    id: 'e10',
    title: '台南400：透．南城',
    artist: '台南市美術館 1館',
    dateRange: '2024/06/21 - 2024/09/01',
    description: '慶祝台南建城400年，透過藝術家的視角，重新詮釋這座古都的巷弄、建築與生活氣味。展場結合視覺與嗅覺體驗，帶你穿梭時空。',
    location: '台南市 · 南美館',
    category: '美術館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1570701257322-e42bc5605d7b?q=80&w=800&auto=format&fit=crop',
    tags: ['台南400', '在地文化', '城市記憶'],
    rating: 4.6,
    sourceUrl: 'https://www.tnam.museum/',
    bookmarksCount: 560,
    comments: []
  },
  {
    id: 'e11',
    title: 'teamLab共創！未來園',
    artist: '國立臺灣科學教育館',
    dateRange: '2024/06/14 - 2024/10/13',
    description: '全球最紅的數位藝術團隊 teamLab 再次來台！這次帶來「共創」主題，讓觀眾的塗鴉變成展覽的一部分，是今夏最夢幻的打卡點。',
    location: '台北市 · 科教館',
    category: '美術館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1550136513-548af4445338?q=80&w=800&auto=format&fit=crop',
    tags: ['數位藝術', 'teamLab', '親子'],
    rating: 4.9,
    sourceUrl: 'https://www.ntsec.gov.tw/',
    bookmarksCount: 2100,
    comments: []
  },
  {
    id: 'e12',
    title: '極度日常：屏東展',
    artist: '屏東美術館',
    dateRange: '2024/04/20 - 2024/08/30',
    description: '兩位日本木雕大師橋本美緒與花房櫻首次在台合體展出。以貓咪、柴犬為主題的超寫實木雕，溫暖療癒，捕捉生活中最平凡卻珍貴的片刻。',
    location: '屏東市 · 屏東美術館',
    category: '美術館',
    type: 'major',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1511553677255-b93b269a815b?q=80&w=800&auto=format&fit=crop',
    tags: ['木雕', '療癒系', '動物'],
    rating: 4.8,
    sourceUrl: 'https://www.ptcg.gov.tw/',
    bookmarksCount: 670,
    comments: []
  },
  {
    id: 'e13',
    title: '宜蘭國際童玩藝術節',
    artist: '冬山河親水公園',
    dateRange: '2024/07/06 - 2024/08/18',
    description: '夏天就是要去宜蘭！結合水上遊戲、國際民俗舞蹈表演與展覽，是台灣最具代表性的夏季慶典之一。',
    location: '宜蘭縣 · 冬山河',
    category: '文創園區',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1533644265403-176378c2e987?q=80&w=800&auto=format&fit=crop',
    tags: ['戶外活動', '親子', '夏日祭典'],
    rating: 4.5,
    sourceUrl: 'https://www.yicfff.tw/',
    bookmarksCount: 1100,
    comments: []
  },
  {
    id: 'e14',
    title: '怪獸與大自然的奇幻世界',
    artist: '中正紀念堂',
    dateRange: '2024/07/04 - 2024/10/13',
    description: '大英自然史博物館與哈利波特電影團隊合作，展示真實世界的珍奇動物與電影中的奇獸之間的關聯。魔法迷與生物迷的雙重享受。',
    location: '台北市 · 中正紀念堂',
    category: '博物館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1633519391081-34440536c04f?q=80&w=800&auto=format&fit=crop',
    tags: ['哈利波特', '自然史', '電影展'],
    rating: 4.7,
    sourceUrl: 'https://www.cksmh.gov.tw/',
    bookmarksCount: 1800,
    comments: []
  },
  {
    id: 'e15',
    title: 'Formosa 玩具圖書館',
    artist: '新北市藝文中心',
    dateRange: '2024/01/01 - 2024/12/31',
    description: '不僅是展覽，更是玩樂空間。收集台灣古早味童玩與現代環保玩具，推廣「以租代買」的永續概念，適合帶小朋友放電。',
    location: '新北市 · 板橋',
    category: '文創園區',
    type: 'major',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop',
    tags: ['玩具', '環保', '免費'],
    rating: 4.2,
    sourceUrl: 'https://www.culture.ntpc.gov.tw/',
    bookmarksCount: 200,
    comments: []
  },
  {
    id: 'e16',
    title: '礦山藝術季：黃金盛典',
    artist: '黃金博物館',
    dateRange: '2024/06/01 - 2024/09/30',
    description: '結合金瓜石的地景與歷史，邀請藝術家在礦山中進行創作。漫步在山城中，轉角就能遇見藝術，感受昔日淘金歲月的輝煌與滄桑。',
    location: '新北市 · 金瓜石',
    category: '歷史人文',
    type: 'major',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?q=80&w=800&auto=format&fit=crop',
    tags: ['地景藝術', '歷史建築', '戶外'],
    rating: 4.6,
    sourceUrl: 'https://www.gep.ntpc.gov.tw/',
    bookmarksCount: 520,
    comments: []
  },
  {
    id: 'e17',
    title: '2024 台灣設計展',
    artist: '台南市美術館 2館',
    dateRange: '2024/10/26 - 2024/11/10',
    description: '年度設計盛事移師台南！以「是台南，當是未來」為主題，展現古都如何透過設計力轉型，結合傳統工藝與現代科技。',
    location: '台南市 · 全區',
    category: '文創園區',
    type: 'major',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1561059488-28451b685822?q=80&w=800&auto=format&fit=crop',
    tags: ['設計', '城市美學', '免費'],
    rating: 4.5,
    sourceUrl: 'https://www.designexpo.org.tw/',
    bookmarksCount: 890,
    comments: []
  },
  {
    id: 'e18',
    title: '朱銘美術館：夜間開館',
    artist: '朱銘美術館',
    dateRange: '2024/07/06 - 2024/08/31',
    description: '夏季限定的夜間開放！在星空下欣賞太極系列雕塑，配合燈光投射，展現出與白天截然不同的磅礴氣勢。每週六還有煙火施放。',
    location: '新北市 · 金山',
    category: '美術館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1599592476686-3532f8313494?q=80&w=800&auto=format&fit=crop',
    tags: ['夜遊', '雕塑', '戶外美術館'],
    rating: 4.8,
    sourceUrl: 'https://www.juming.org.tw/',
    bookmarksCount: 1300,
    comments: []
  },
  {
    id: 'e19',
    title: '熱帶天堂：印尼當代藝術',
    artist: '嘉義市立美術館',
    dateRange: '2024/05/15 - 2024/08/25',
    description: '嘉美館透過這次展覽，開啟台灣與東南亞的藝術對話。色彩鮮豔、充滿生命力的印尼當代藝術，帶給觀眾強烈的視覺衝擊。',
    location: '嘉義市 · 嘉美館',
    category: '美術館',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=800&auto=format&fit=crop',
    tags: ['東南亞', '當代繪畫', '文化交流'],
    rating: 4.1,
    sourceUrl: 'https://chiayiartmuseum.chiayi.gov.tw/',
    bookmarksCount: 220,
    comments: []
  },
  {
    id: 'e20',
    title: '古物揭密：刀劍光影',
    artist: '國立臺灣歷史博物館',
    dateRange: '2024/04/01 - 2024/12/31',
    description: '展出館藏的珍貴刀劍兵器，從鄭成功時代到日治時期，每把刀劍背後都刻畫著台灣歷史的動盪與變遷。',
    location: '台南市 · 臺史博',
    category: '歷史人文',
    type: 'major',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1589828989531-18cb93822188?q=80&w=800&auto=format&fit=crop',
    tags: ['冷兵器', '台灣史', '軍事迷'],
    rating: 4.4,
    sourceUrl: 'https://www.nmth.gov.tw/',
    bookmarksCount: 410,
    comments: []
  }
];

// 2. 小展 (Minor) - 藝廊、替代空間、學校
const MINOR_EXHIBITIONS: Exhibition[] = [
  {
    id: 'm1',
    title: '森山大道：記憶的片斷',
    artist: '亞紀畫廊 Each Modern',
    dateRange: '2024/07/12 - 2024/08/24',
    description: '日本攝影大師森山大道個展，展出其經典的黑白街拍作品。透過高反差的粗顆粒影像，凝視都市中最赤裸的慾望與孤寂。',
    location: '台北市 · 亞紀畫廊',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1517544845501-bb78ccdadcd7?q=80&w=800&auto=format&fit=crop',
    tags: ['攝影', '黑白', '大師'],
    rating: 4.7,
    sourceUrl: 'https://www.eachmodern.com/',
    bookmarksCount: 320,
    comments: []
  },
  {
    id: 'm2',
    title: '紙的維度：Zine 與獨立出版',
    artist: '朋丁 Pon Ding',
    dateRange: '2024/06/01 - 2024/07/30',
    description: '集合台灣與日本的獨立創作者，展示 Zine（小誌）的多樣性。現場有許多手作、限量發行的刊物，感受紙本的溫暖與實驗性。',
    location: '台北市 · 朋丁',
    category: '複合空間',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?q=80&w=800&auto=format&fit=crop',
    tags: ['獨立出版', '插畫', '文青'],
    rating: 4.5,
    sourceUrl: 'https://pon-ding.com/',
    bookmarksCount: 210,
    comments: []
  },
  {
    id: 'm3',
    title: '混沌操作：數位藝術實驗',
    artist: '濕地 venue',
    dateRange: '2024/08/01 - 2024/08/15',
    description: '由新銳藝術團體策劃，利用生成式 AI 與互動裝置，將濕地的地下空間改造成一個充滿訊號雜訊的迷幻場域。',
    location: '台北市 · 濕地',
    category: '實驗藝術',
    type: 'minor',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    tags: ['新媒體', 'AI', '前衛'],
    rating: 4.2,
    sourceUrl: 'https://www.venue.tw/',
    bookmarksCount: 150,
    comments: []
  },
  {
    id: 'm4',
    title: '台灣原生：油畫聯展',
    artist: '尊彩藝術中心 Liang Gallery',
    dateRange: '2024/05/20 - 2024/07/10',
    description: '聚焦於台灣前輩藝術家與中生代畫家，透過油彩描繪台灣的山川與人文風景，展現這塊土地深厚的情感連結。',
    location: '台北市 · 內湖',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
    tags: ['油畫', '台灣美術', '收藏'],
    rating: 4.6,
    sourceUrl: 'https://www.lianggallery.com/',
    bookmarksCount: 280,
    comments: []
  },
  {
    id: 'm5',
    title: '植物學家：伊日藝術計劃',
    artist: 'YIRI ARTS',
    dateRange: '2024/04/10 - 2024/06/30',
    description: '以植物為主題的當代藝術展。藝術家們透過繪畫、雕塑與標本，探討人類與自然生態之間微妙的共生關係。',
    location: '台北市 · 內湖',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
    tags: ['植物', '療癒', '當代'],
    rating: 4.8,
    sourceUrl: 'https://yiriarts.com.tw/',
    bookmarksCount: 400,
    comments: []
  },
  {
    id: 'm6',
    title: 'Pop Art 潮流收藏展',
    artist: '多納藝術 Donna Art',
    dateRange: '2024/07/01 - 2024/08/30',
    description: '展出 KAWS、Banksy 等國際潮流藝術家的版畫與公仔。色彩繽紛、充滿街頭風格，是年輕藏家入門的最佳選擇。',
    location: '台北市 · 華山紅磚區',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1573521193826-58c7dc2e13e3?q=80&w=800&auto=format&fit=crop',
    tags: ['潮流', '公仔', '街頭藝術'],
    rating: 4.4,
    sourceUrl: 'https://www.donnaart.com.tw/',
    bookmarksCount: 550,
    comments: []
  },
  {
    id: 'm7',
    title: '時空裂縫：裝置藝術展',
    artist: '就在藝術空間 Project Fulfill',
    dateRange: '2024/06/15 - 2024/08/10',
    description: '利用光影與鏡面材質，在有限的畫廊空間中創造出無限延伸的錯覺。觀眾在移動中會感受到空間的扭曲與變化。',
    location: '台北市 · 大安區',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1515543167389-c49b0682baeb?q=80&w=800&auto=format&fit=crop',
    tags: ['裝置藝術', '空間', '極簡'],
    rating: 4.3,
    sourceUrl: 'https://www.projectfulfill.com/',
    bookmarksCount: 180,
    comments: []
  },
  {
    id: 'm8',
    title: '新浪潮：錄像藝術節',
    artist: 'VT Artsalon 非常廟',
    dateRange: '2024/09/01 - 2024/09/30',
    description: '台灣歷史最悠久的藝術家營運空間之一。本次展覽聚焦於錄像藝術 (Video Art)，呈現年輕世代對於影像敘事的獨特觀點。',
    location: '台北市 · 中山區',
    category: '實驗藝術',
    type: 'minor',
    priceMode: 'paid',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
    tags: ['錄像', '實驗', '藝術家營運'],
    rating: 4.1,
    sourceUrl: 'http://www.vtartsalon.com/',
    bookmarksCount: 120,
    comments: []
  },
  {
    id: 'm9',
    title: '未定義：台藝大113級畢業展',
    artist: '台灣藝術大學',
    dateRange: '2024/05/15 - 2024/05/30',
    description: '美術學院畢業聯展。這群即將踏入社會的新銳藝術家，用最生猛、不受拘束的創作，向世界宣告他們的存在。',
    location: '台北市 · 松山文創園區',
    category: '校園展',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    tags: ['畢業展', '新銳', '免費'],
    rating: 4.5,
    sourceUrl: 'https://www.ntua.edu.tw/',
    bookmarksCount: 600,
    comments: []
  },
  {
    id: 'm10',
    title: '光之聚落：寶藏巖駐村成果',
    artist: '寶藏巖國際藝術村',
    dateRange: '2024/10/01 - 2024/11/30',
    description: '來自世界各地的駐村藝術家，深入寶藏巖的聚落生活，創作出與當地環境對話的作品。夜晚點燈後更是別有一番風味。',
    location: '台北市 · 公館',
    category: '複合空間',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1565151443833-2c5e9b864b43?q=80&w=800&auto=format&fit=crop',
    tags: ['駐村', '聚落', '夜遊'],
    rating: 4.6,
    sourceUrl: 'https://www.artistvillage.org/',
    bookmarksCount: 450,
    comments: []
  },
  {
    id: 'm11',
    title: '荒花插畫週',
    artist: '荒花 Bookstore',
    dateRange: '2024/07/20 - 2024/08/05',
    description: '隱身在巷弄裡的獨立書店與展演空間。展出多位風格獨特的插畫家手稿，現場還有似顏繪活動。',
    location: '台北市 · 萬華',
    category: '書店',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1544252890-a1e74f358356?q=80&w=800&auto=format&fit=crop',
    tags: ['插畫', '獨立書店', '似顏繪'],
    rating: 4.7,
    sourceUrl: 'https://www.facebook.com/wildflowerbookstore/',
    bookmarksCount: 290,
    comments: []
  },
  {
    id: 'm12',
    title: '舊書與版畫的對話',
    artist: '舊香居',
    dateRange: '2024/04/01 - 2024/05/31',
    description: '知名古書店舉辦的小型展覽，展出珍稀的絕版書籍封面與藏書票版畫。書香與墨香交織，是愛書人的天堂。',
    location: '台北市 · 師大',
    category: '書店',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=800&auto=format&fit=crop',
    tags: ['古書', '版畫', '歷史'],
    rating: 4.8,
    sourceUrl: 'https://www.facebook.com/juxiangju/',
    bookmarksCount: 330,
    comments: []
  },
  {
    id: 'm13',
    title: '靜謐時刻：日常器物展',
    artist: '雄獅星空 Link Lion',
    dateRange: '2024/06/01 - 2024/07/15',
    description: '位於中山區的寧靜角落。展出日本陶藝家的生活器皿，結合選書與咖啡，提供一個讓心靈沉澱的空間。',
    location: '台北市 · 中山',
    category: '複合空間',
    type: 'minor',
    priceMode: 'paid', // Coffee shop usually requires a drink
    imageUrl: 'https://images.unsplash.com/photo-1616489953121-778875505688?q=80&w=800&auto=format&fit=crop',
    tags: ['陶藝', '生活美學', '咖啡'],
    rating: 4.6,
    sourceUrl: 'https://www.facebook.com/linklion/',
    bookmarksCount: 250,
    comments: []
  },
  {
    id: 'm14',
    title: '墨的新意：現代水墨聯展',
    artist: '一票人票畫空間',
    dateRange: '2024/05/10 - 2024/06/20',
    description: '永康街附近的雅緻畫廊。展出打破傳統筆墨規範的新水墨作品，在傳統與現代之間尋找平衡。',
    location: '台北市 · 永康街',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1688649842880-60b6d2714224?q=80&w=800&auto=format&fit=crop',
    tags: ['水墨', '書畫', '傳統創新'],
    rating: 4.2,
    sourceUrl: 'https://www.facebook.com/piao.piao.art.space/',
    bookmarksCount: 140,
    comments: []
  },
  {
    id: 'm15',
    title: '抽象的現在式',
    artist: '當代一畫廊',
    dateRange: '2024/08/10 - 2024/09/20',
    description: '專注於抽象藝術的推廣。展出多位中生代藝術家的抽象繪畫，探討色彩、線條與情感的純粹表現。',
    location: '台北市 · 信義路',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop',
    tags: ['抽象', '繪畫', '學術'],
    rating: 4.0,
    sourceUrl: 'https://www.facebook.com/leadinggallery/',
    bookmarksCount: 110,
    comments: []
  },
  {
    id: 'm16',
    title: '亞洲當代新視野',
    artist: '索卡藝術 Soka Art',
    dateRange: '2024/07/01 - 2024/08/15',
    description: '引進中國、日本、韓國的年輕藝術家作品。風格多元，從可愛療癒到批判寫實，呈現亞洲當代藝術的豐富樣貌。',
    location: '台北市 · 內湖',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop',
    tags: ['亞洲當代', '國際觀點', '收藏'],
    rating: 4.3,
    sourceUrl: 'http://www.soka-art.com/',
    bookmarksCount: 190,
    comments: []
  },
  {
    id: 'm17',
    title: '木與石的對話',
    artist: '赤粒藝術',
    dateRange: '2024/09/01 - 2024/10/10',
    description: '以材質為導向的雕塑展。藝術家們透過自然的木頭與石頭，保留材質本身的紋理，創作出充滿禪意的作品。',
    location: '台北市 · 大安區',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1536605068945-813d9c49007f?q=80&w=800&auto=format&fit=crop',
    tags: ['雕塑', '材質', '禪意'],
    rating: 4.5,
    sourceUrl: 'http://www.redgoldfineart.com/',
    bookmarksCount: 160,
    comments: []
  },
  {
    id: 'm18',
    title: '隈研吾：五感的建築',
    artist: '白石畫廊 Whitestone',
    dateRange: '2024/04/10 - 2024/06/02',
    description: '國際知名建築師隈研吾個展。透過模型、手稿與影像，展示其「負建築」的哲學以及對材料的獨特運用。',
    location: '台北市 · 內湖',
    category: '藝廊',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=800&auto=format&fit=crop',
    tags: ['建築', '大師', '隈研吾'],
    rating: 4.9,
    sourceUrl: 'https://www.whitestone-gallery.com/',
    bookmarksCount: 700,
    comments: []
  },
  {
    id: 'm19',
    title: 'Praxis：實踐設計畢業展',
    artist: '實踐大學',
    dateRange: '2024/05/18 - 2024/05/26',
    description: '台灣設計界的年度盛事。服裝設計、工業設計、建築設計等系所的畢業製作，充滿前衛與實驗精神。',
    location: '台北市 · 實踐校區',
    category: '校園展',
    type: 'minor',
    priceMode: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800&auto=format&fit=crop',
    tags: ['設計', '時尚', '畢業展'],
    rating: 4.6,
    sourceUrl: 'https://www.usc.edu.tw/',
    bookmarksCount: 580,
    comments: []
  },
  {
    id: 'm20',
    title: '咖啡因與靈感',
    artist: 'Congrats Café',
    dateRange: '2024/06/01 - 2024/07/31',
    description: '在充滿古董傢俱的咖啡廳二樓，展出新生代插畫家的手繪作品。點一杯咖啡，享受午後的藝術時光。',
    location: '台北市 · 文昌街',
    category: '咖啡廳',
    type: 'minor',
    priceMode: 'paid', // Coffee shop usually requires a drink
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
    tags: ['插畫', '咖啡', '老屋'],
    rating: 4.4,
    sourceUrl: 'https://www.facebook.com/congratscafe.tw/',
    bookmarksCount: 220,
    comments: []
  }
];

const INITIAL_EXHIBITIONS = [...MAJOR_EXHIBITIONS, ...MINOR_EXHIBITIONS];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: '歡迎來到 Mostra', message: '這裡匯集了台灣最棒的展覽資訊。', read: false, timestamp: '剛剛', type: 'success' },
  { id: '2', title: '追蹤名單更新', message: '您關注的「奇美博物館」發布了新消息。', read: false, timestamp: '1小時前', type: 'info' },
];

const MOCK_USER: User = {
  id: 'u1',
  name: '王小明',
  email: 'ming@example.com',
  avatar: 'https://picsum.photos/id/64/200/200',
  bookmarkedExhibitionIds: ['e1', 'e5', 'e7']
};

// --- 主程式 ---

export default function App() {
  // Global State
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(INITIAL_EXHIBITIONS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<ViewState | null>(null);
  const [pendingBookmarks, setPendingBookmarks] = useState<string[]>([]);
  
  // UI State
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Derived State
  const activeExhibition = exhibitions.find(e => e.id === selectedExhibitionId);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handlers
  const handleLogin = () => {
    // Create new user object
    const newUser = { ...MOCK_USER };
    
    // Merge pending bookmarks
    if (pendingBookmarks.length > 0) {
      newUser.bookmarkedExhibitionIds = [...new Set([...newUser.bookmarkedExhibitionIds, ...pendingBookmarks])];
    }
    
    setUser(newUser);
    setPendingBookmarks([]);

    if (redirectAfterLogin) {
      setView(redirectAfterLogin);
      setRedirectAfterLogin(null);
    } else {
      setView('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const handleNavigate = (target: ViewState, id?: string) => {
    if (id) setSelectedExhibitionId(id);
    
    if (target === 'submit' && !user) {
      setRedirectAfterLogin('submit');
      setView('login');
      return;
    }

    if (target === 'profile' && !user) {
      setView('login');
      return;
    }

    setView(target);
    setIsNotifOpen(false);
    window.scrollTo(0, 0);
  };

  const handleAddExhibition = (newExhibition: Exhibition) => {
    setExhibitions([newExhibition, ...exhibitions]);
    setView('home');
    const newNotif: Notification = {
      id: Date.now().toString(),
      title: '發布成功',
      message: `您的展訊 "${newExhibition.title}" 已成功上架。`,
      read: false,
      timestamp: '剛剛',
      type: 'success'
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleAddComment = (exhibitionId: string, comment: Comment) => {
    setExhibitions(prev => prev.map(ex => {
      if (ex.id === exhibitionId) {
        const newComments = [comment, ...ex.comments];
        const total = newComments.reduce((acc, c) => acc + c.rating, 0);
        const newRating = total / newComments.length;
        return { ...ex, comments: newComments, rating: newRating };
      }
      return ex;
    }));
  };

  const handleToggleBookmark = (e: React.MouseEvent, exId: string) => {
    e.stopPropagation();
    if (!user) {
      setRedirectAfterLogin('home');
      setView('login');
      return;
    }

    const isBookmarked = user.bookmarkedExhibitionIds.includes(exId);
    
    setUser(prev => ({
      ...prev!,
      bookmarkedExhibitionIds: isBookmarked 
        ? prev!.bookmarkedExhibitionIds.filter(id => id !== exId)
        : [...prev!.bookmarkedExhibitionIds, exId]
    }));

    setExhibitions(prev => prev.map(ex => {
      if (ex.id === exId) {
        return { ...ex, bookmarksCount: ex.bookmarksCount + (isBookmarked ? -1 : 1) };
      }
      return ex;
    }));
  };

  const handleSwipeBookmark = (exId: string) => {
    if (!user) return; // Silent fail if guest (SwipeDeck handles guest tracking locally now)
    
    // Only bookmark if not already bookmarked
    if (!user.bookmarkedExhibitionIds.includes(exId)) {
        setUser(prev => ({
            ...prev!,
            bookmarkedExhibitionIds: [...prev!.bookmarkedExhibitionIds, exId]
        }));
        setExhibitions(prev => prev.map(ex => {
            if (ex.id === exId) {
                return { ...ex, bookmarksCount: ex.bookmarksCount + 1 };
            }
            return ex;
        }));
    }
  };

  const handleBatchAddBookmarks = (ids: string[]) => {
    if (user) {
       const newIds = ids.filter(id => !user.bookmarkedExhibitionIds.includes(id));
       if (newIds.length > 0) {
           setUser(prev => ({
               ...prev!,
               bookmarkedExhibitionIds: [...prev!.bookmarkedExhibitionIds, ...newIds]
           }));
           // Update counts visually for immediate feedback
           setExhibitions(prev => prev.map(ex => {
             if (newIds.includes(ex.id)) {
               return { ...ex, bookmarksCount: ex.bookmarksCount + 1 };
             }
             return ex;
           }));
       }
       setView('collections');
    } else {
       setPendingBookmarks(ids);
       setRedirectAfterLogin('collections');
       setView('login');
    }
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
    e.currentTarget.onerror = null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-neutral-900 flex flex-col pb-safe">
      
      {/* --- TOP BAR --- */}
      {(view === 'home' || view === 'detail' || view === 'collections' || view === 'small_exhibitions') && (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 safe-top px-4 h-14 flex items-center justify-between">
          <button onClick={() => setView('home')} className="flex items-center gap-2">
             <Logo />
             <span className="font-serif text-lg font-bold tracking-tight">Mostra</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); if(!isNotifOpen) markNotificationsRead(); }}
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full relative transition-colors"
            >
              <Bell size={22} className={isNotifOpen ? "text-black fill-black" : ""} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white z-10"></span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
                </>
              )}
            </button>
            
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">通知中心</h3>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-sm">暫無新通知</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{n.timestamp}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow w-full max-w-md mx-auto sm:max-w-xl md:max-w-4xl lg:max-w-7xl pb-24 px-0 md:px-4">
        {view === 'home' && (
          <HomeView 
            exhibitions={exhibitions} 
            user={user} 
            onSelect={(id) => handleNavigate('detail', id)} 
            onToggleBookmark={handleToggleBookmark}
            onSwipeBookmark={handleSwipeBookmark}
            onBatchAddBookmarks={handleBatchAddBookmarks}
            onViewCollections={() => setView('collections')}
            onImageError={handleImageError}
          />
        )}
        {view === 'collections' && (
          <CollectionsView 
             exhibitions={exhibitions}
             user={user}
             onSelect={(id) => handleNavigate('detail', id)}
             onToggleBookmark={handleToggleBookmark}
             onLoginReq={() => { setRedirectAfterLogin('collections'); setView('login'); }}
             onGoHome={() => setView('home')}
             onImageError={handleImageError}
          />
        )}
        {view === 'small_exhibitions' && (
          <SmallExhibitionsView 
            exhibitions={exhibitions}
            user={user}
            onSelect={(id) => handleNavigate('detail', id)}
            onToggleBookmark={handleToggleBookmark}
            onImageError={handleImageError}
          />
        )}
        {view === 'detail' && activeExhibition && (
          <DetailView 
            exhibition={activeExhibition} 
            user={user} 
            onBack={() => setView('home')} 
            onAddComment={handleAddComment}
            onLoginReq={() => { setRedirectAfterLogin('detail'); setView('login'); }}
            onToggleBookmark={handleToggleBookmark}
            onImageError={handleImageError}
          />
        )}
        {view === 'login' && (
          <LoginView onLogin={handleLogin} onCancel={() => setView('home')} />
        )}
        {view === 'profile' && user && (
          <ProfileView user={user} onLogout={handleLogout} />
        )}
        {view === 'submit' && user && (
          <SubmitView user={user} onSubmit={handleAddExhibition} onCancel={() => setView('home')} />
        )}
      </main>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      {(view !== 'login' && view !== 'submit') && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe z-50">
          <div className="max-w-md mx-auto px-1 h-16 grid grid-cols-5 items-center relative">
            
            {/* 1. Home */}
            <button 
              onClick={() => setView('home')}
              className={`flex flex-col items-center justify-center gap-1 ${view === 'home' ? 'text-black' : 'text-gray-400'}`}
            >
              <Home size={22} strokeWidth={view === 'home' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">大展</span>
            </button>

            {/* 2. Small Exhibitions (Swapped from right to left) */}
             <button 
              onClick={() => setView('small_exhibitions')}
              className={`flex flex-col items-center justify-center gap-1 ${view === 'small_exhibitions' ? 'text-black' : 'text-gray-400'}`}
            >
              <Tent size={22} strokeWidth={view === 'small_exhibitions' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">小展</span>
            </button>

            {/* 3. Center Plus */}
            <div className="relative flex justify-center items-center">
              <button 
                onClick={() => handleNavigate('submit')}
                className="w-12 h-12 bg-black text-white rounded-full shadow-lg shadow-black/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform -mt-6 border-4 border-gray-50"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* 4. Collections (Swapped from left to right) */}
            <button 
              onClick={() => setView('collections')}
              className={`flex flex-col items-center justify-center gap-1 ${view === 'collections' ? 'text-black' : 'text-gray-400'}`}
            >
              <Bookmark size={22} strokeWidth={view === 'collections' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">收藏</span>
            </button>

            {/* 5. Profile */}
            <button 
              onClick={() => user ? setView('profile') : setView('login')}
              className={`flex flex-col items-center justify-center gap-1 ${view === 'profile' ? 'text-black' : 'text-gray-400'}`}
            >
              {user ? (
                 <img src={user.avatar} className={`w-6 h-6 rounded-full border ${view === 'profile' ? 'border-black' : 'border-gray-200'}`} alt="Profile" />
              ) : (
                 <UserIcon size={22} strokeWidth={2} />
              )}
              <span className="text-[10px] font-medium">{user ? '會員' : '登入'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-VIEWS ---

function HomeView({ 
  exhibitions, 
  user,
  onSelect,
  onToggleBookmark,
  onSwipeBookmark,
  onBatchAddBookmarks,
  onViewCollections,
  onImageError
}: { 
  exhibitions: Exhibition[], 
  user: User | null,
  onSelect: (id: string) => void,
  onToggleBookmark: (e: React.MouseEvent, id: string) => void,
  onSwipeBookmark: (id: string) => void,
  onBatchAddBookmarks: (ids: string[]) => void,
  onViewCollections: () => void,
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  // Default to deck view
  const [viewMode, setViewMode] = useState<'grid' | 'deck'>('deck');

  // Filter for MAJOR exhibitions only
  const majorExhibitions = exhibitions.filter(ex => ex.type === 'major');

  // Tags for Major Exhibitions - Removed '親子互動'
  const tags = [
    { name: '免費', icon: <Ticket size={20} /> },
    { name: '售票', icon: <CircleDollarSign size={20} /> },
    { name: '美術館', icon: <Landmark size={20} /> },
    { name: '博物館', icon: <History size={20} /> },
    { name: '文創園區', icon: <Grid size={20} /> },
  ];

  const filteredExhibitions = selectedTag
    ? majorExhibitions.filter(ex => {
        if (selectedTag === '免費') return ex.priceMode === 'free';
        if (selectedTag === '售票') return ex.priceMode === 'paid';
        return ex.category === selectedTag || ex.tags.includes(selectedTag);
      })
    : majorExhibitions;

  return (
    <div className="animate-in fade-in duration-500 pb-4 h-full flex flex-col">
      <div className="px-4 pt-6 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">必看大展</h1>
          <p className="text-gray-500 text-sm mt-1">博物館與美術館的年度精選</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('deck')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'deck' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
          >
            <Layers size={18} />
          </button>
        </div>
      </div>
      
      {/* Tags Scroll for Major Exhibitions */}
      <div className="px-4 overflow-x-auto no-scrollbar mb-6 flex-shrink-0">
        <div className="flex gap-3 pb-2">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${!selectedTag ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
          >
             <span className="text-xs font-bold">全部</span>
          </button>
          {tags.map(tag => (
             <button
               key={tag.name}
               onClick={() => setSelectedTag(tag.name)}
               className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${selectedTag === tag.name ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
             >
               {tag.icon}
               <span className="text-xs font-bold">{tag.name}</span>
             </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? (
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
          {filteredExhibitions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm col-span-full">沒有符合條件的展覽</div>
          ) : (
            filteredExhibitions.map((ex) => {
              const isBookmarked = user?.bookmarkedExhibitionIds.includes(ex.id) || false;
              return (
                <div 
                  key={ex.id} 
                  onClick={() => onSelect(ex.id)}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer flex flex-col"
                >
                  <div className="relative h-52 md:h-60 overflow-hidden bg-gray-100">
                    <img 
                      src={ex.imageUrl} 
                      alt={ex.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      loading="lazy"
                      onError={onImageError}
                    />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <StarRating rating={ex.rating} size={12} />
                        <span className="text-xs font-bold ml-1">{ex.rating.toFixed(1)}</span>
                      </div>
                      {/* Price Mode Badge */}
                      <span className={`px-2 py-1 rounded-lg shadow-sm text-xs font-bold backdrop-blur-md ${ex.priceMode === 'free' ? 'bg-green-100/90 text-green-700' : 'bg-amber-100/90 text-amber-800'}`}>
                        {ex.priceMode === 'free' ? '免費' : '售票'}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => onToggleBookmark(e, ex.id)}
                      className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-1.5 rounded-full shadow-sm flex items-center gap-1.5 hover:bg-white transition-colors group/btn"
                    >
                       <Bookmark 
                        size={16} 
                        className={`${isBookmarked ? 'fill-black text-black' : 'text-gray-400 group-hover/btn:text-black'} transition-colors`} 
                       />
                       <span className="text-xs font-bold pr-1 text-gray-600">{ex.bookmarksCount}</span>
                    </button>

                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                       <div className="text-white text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                         <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">{ex.category}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold font-serif mb-1 leading-snug text-gray-900 line-clamp-2">{ex.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-1">{ex.artist}</p>
                    
                    <div className="mt-auto flex flex-col gap-1.5 text-gray-500 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="shrink-0 text-gray-400" />
                        <span>{ex.dateRange}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0 text-gray-400" />
                        <span className="truncate">{ex.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <SwipeDeck 
          exhibitions={filteredExhibitions} 
          user={user}
          onBookmark={onSwipeBookmark}
          onSelect={onSelect}
          onBatchAddBookmarks={onBatchAddBookmarks}
          onViewCollections={onViewCollections}
          onSwitchToGrid={() => setViewMode('grid')}
          onImageError={onImageError}
        />
      )}
    </div>
  );
}

function SwipeDeck({ 
  exhibitions, 
  user,
  onBookmark, 
  onSelect,
  onBatchAddBookmarks,
  onViewCollections,
  onSwitchToGrid,
  onImageError
}: { 
  exhibitions: Exhibition[], 
  user: User | null,
  onBookmark: (id: string) => void,
  onSelect: (id: string) => void,
  onBatchAddBookmarks: (ids: string[]) => void,
  onViewCollections: () => void,
  onSwitchToGrid: () => void,
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDir, setExitDir] = useState<null | 'left' | 'right'>(null);
  const [sessionLikedExhibitions, setSessionLikedExhibitions] = useState<Exhibition[]>([]);

  const canSwipe = currentIndex < exhibitions.length;
  const currentExhibition = exhibitions[currentIndex];
  const nextExhibition = exhibitions[currentIndex + 1];

  const handleSwipe = (direction: 'left' | 'right') => {
    setExitDir(direction);
    if (direction === 'right') {
        onBookmark(currentExhibition.id);
        // Track locally for summary view (Guest mode support)
        setSessionLikedExhibitions(prev => [...prev, currentExhibition]);
    }
    setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setExitDir(null);
    }, 200); // Wait for animation
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSessionLikedExhibitions([]);
  };

  const handleSaveSession = () => {
    const ids = sessionLikedExhibitions.map(ex => ex.id);
    onBatchAddBookmarks(ids);
  };

  if (!canSwipe) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh] animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Check size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold font-serif mb-2">探索完成！</h2>
            <p className="text-gray-500 mb-8 text-sm">您已瀏覽完目前的篩選結果。</p>
            
            {sessionLikedExhibitions.length > 0 && (
              <div className="w-full mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3 text-left">您喜歡的展覽 ({sessionLikedExhibitions.length})</p>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                   {sessionLikedExhibitions.map(ex => (
                     <div key={ex.id} className="w-20 shrink-0 flex flex-col gap-1">
                        <img src={ex.imageUrl} className="w-20 h-20 rounded-lg object-cover border border-gray-100" onError={onImageError}/>
                        <span className="text-[10px] text-gray-600 truncate">{ex.title}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}

            <div className="w-full space-y-3">
              {sessionLikedExhibitions.length > 0 && (
                <button 
                  onClick={handleSaveSession}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform"
                >
                  {user ? <Bookmark size={18} className="fill-white" /> : <LogIn size={18} />}
                  {user ? "查看收藏" : "登入並儲存收藏"}
                </button>
              )}
              
              <button 
                onClick={onSwitchToGrid}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-transform"
              >
                <List size={18} />
                查看完整列表
              </button>

              <button 
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 text-gray-500 border border-transparent rounded-xl font-bold hover:bg-gray-100 active:scale-95 transition-transform text-xs"
              >
                  <RotateCcw size={16} />
                  重新瀏覽
              </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden px-4 pb-4">
        <div className="relative w-full max-w-sm aspect-[3/4] md:aspect-[3/4] lg:h-[500px]">
             {/* Background Cards (Visual Stack) */}
             {nextExhibition && (
                 <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-gray-100 scale-95 translate-y-4 opacity-60 z-0">
                     <img src={nextExhibition.imageUrl} className="w-full h-full object-cover rounded-3xl" onError={onImageError} />
                 </div>
             )}

             {/* Draggable Top Card */}
             <DraggableCard 
                key={currentExhibition.id}
                exhibition={currentExhibition}
                onSwipe={handleSwipe}
                onSelect={() => onSelect(currentExhibition.id)}
                exitDir={exitDir}
                onImageError={onImageError}
             />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-8">
            <button 
                onClick={() => handleSwipe('left')}
                className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-md text-red-500 flex items-center justify-center hover:scale-110 hover:bg-red-50 transition-all active:scale-90"
            >
                <X size={28} strokeWidth={2.5} />
            </button>
            <button 
                 onClick={() => onSelect(currentExhibition.id)}
                 className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-all"
            >
                 <Info size={20} />
            </button>
            <button 
                onClick={() => handleSwipe('right')}
                className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-md text-green-500 flex items-center justify-center hover:scale-110 hover:bg-green-50 transition-all active:scale-90"
            >
                <Heart size={28} className="fill-current" />
            </button>
        </div>
    </div>
  );
}

interface DraggableCardProps {
    exhibition: Exhibition;
    onSwipe: (dir: 'left' | 'right') => void;
    onSelect: () => void;
    exitDir: 'left' | 'right' | null;
    onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ 
    exhibition, 
    onSwipe, 
    onSelect,
    exitDir,
    onImageError
}) => {
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0 });

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        startPos.current = { x: clientX, y: clientY };
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        const deltaX = clientX - startPos.current.x;
        const deltaY = clientY - startPos.current.y;
        setDragPosition({ x: deltaX, y: deltaY });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        const threshold = 100;
        if (dragPosition.x > threshold) {
            onSwipe('right');
        } else if (dragPosition.x < -threshold) {
            onSwipe('left');
        } else {
            setDragPosition({ x: 0, y: 0 });
        }
    };

    const getRotation = () => {
        if (exitDir === 'left') return -20;
        if (exitDir === 'right') return 20;
        return dragPosition.x * 0.1;
    };

    const getTranslateX = () => {
        if (exitDir === 'left') return -1000;
        if (exitDir === 'right') return 1000;
        return dragPosition.x;
    };

    return (
        <div 
            ref={cardRef}
            className="absolute top-0 left-0 w-full h-full rounded-3xl bg-white shadow-xl overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing border border-gray-100"
            style={{ 
                transform: `translateX(${getTranslateX()}px) translateY(${dragPosition.y * 0.1}px) rotate(${getRotation()}deg)`,
                transition: isDragging ? 'none' : 'transform 0.5s ease-out'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={() => { if(isDragging) handleTouchEnd() }}
        >
             <div className="relative w-full h-full pointer-events-none">
                <img src={exhibition.imageUrl} className="w-full h-full object-cover" onError={onImageError} draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-white pb-16">
                    <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg inline-block text-xs font-bold mb-2">
                        {exhibition.category}
                    </div>
                    <h2 className="text-3xl font-serif font-bold leading-tight mb-2 drop-shadow-md">{exhibition.title}</h2>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                        <MapPin size={14} />
                        {exhibition.location}
                    </p>
                </div>

                {/* Like/Nope Overlays */}
                <div 
                    className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-1 -rotate-12 opacity-0 transition-opacity"
                    style={{ opacity: dragPosition.x > 50 ? (dragPosition.x / 150) : 0 }}
                >
                    <span className="text-green-500 font-black text-2xl uppercase tracking-widest">LIKE</span>
                </div>
                <div 
                    className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-1 rotate-12 opacity-0 transition-opacity"
                    style={{ opacity: dragPosition.x < -50 ? (Math.abs(dragPosition.x) / 150) : 0 }}
                >
                    <span className="text-red-500 font-black text-2xl uppercase tracking-widest">NOPE</span>
                </div>
             </div>

             {/* Info Button Overlay (Clickable) */}
             <div 
                className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-2 rounded-full pointer-events-auto cursor-pointer active:scale-95 transition-transform"
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                onTouchEnd={(e) => { e.stopPropagation(); }}
             >
                <Info size={24} className="text-white" />
             </div>
        </div>
    );
};

function CollectionsView({ 
    exhibitions, 
    user, 
    onSelect,
    onToggleBookmark,
    onLoginReq,
    onGoHome,
    onImageError
}: { 
    exhibitions: Exhibition[], 
    user: User | null, 
    onSelect: (id: string) => void,
    onToggleBookmark: (e: React.MouseEvent, id: string) => void,
    onLoginReq: () => void,
    onGoHome: () => void,
    onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Bookmark size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">查看您的收藏</h2>
        <p className="text-gray-500 mb-8 max-w-xs">登入後即可建立專屬的展覽清單，隨時回顧喜愛的藝術活動。</p>
        <button 
          onClick={onLoginReq}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/20 hover:scale-105 transition-transform w-full max-w-xs"
        >
          立即登入
        </button>
      </div>
    );
  }

  const savedExhibitions = exhibitions.filter(ex => user.bookmarkedExhibitionIds.includes(ex.id));

  return (
    <div className="px-4 py-6 min-h-full animate-in fade-in duration-500">
      <h1 className="text-2xl font-serif font-bold mb-6">我的收藏</h1>
      
      {savedExhibitions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
          <p className="text-gray-400 mb-4">還沒有收藏任何展覽</p>
          <button onClick={onGoHome} className="text-black font-bold text-sm border-b-2 border-black pb-0.5">去探索</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedExhibitions.map(ex => (
            <div 
              key={ex.id} 
              onClick={() => onSelect(ex.id)}
              className="flex bg-white p-3 rounded-2xl gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                <img src={ex.imageUrl} alt={ex.title} className="w-full h-full object-cover" onError={onImageError} />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-1">{ex.title}</h3>
                  <p className="text-xs text-gray-500">{ex.artist}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    <Calendar size={10} />
                    <span>{ex.dateRange.split(' - ')[0]}</span>
                  </div>
                  <button 
                    onClick={(e) => onToggleBookmark(e, ex.id)}
                    className="p-1.5 hover:bg-red-50 rounded-full group"
                  >
                    <Bookmark size={16} className="fill-black text-black group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SmallExhibitionsView({ 
    exhibitions, 
    user,
    onSelect,
    onToggleBookmark,
    onImageError
}: { 
    exhibitions: Exhibition[], 
    user: User | null,
    onSelect: (id: string) => void,
    onToggleBookmark: (e: React.MouseEvent, id: string) => void,
    onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  const minorExhibitions = exhibitions.filter(ex => ex.type === 'minor');

  return (
    <div className="animate-in fade-in duration-500 px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900">探索小展</h1>
        <p className="text-gray-500 text-sm mt-1">獨立藝廊、學校畢製與另類空間</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {minorExhibitions.map(ex => {
          const isBookmarked = user?.bookmarkedExhibitionIds.includes(ex.id) || false;
          return (
            <div 
              key={ex.id}
              onClick={() => onSelect(ex.id)}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                 <img src={ex.imageUrl} alt={ex.title} className="w-full h-full object-cover" onError={onImageError} />
                 <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
                   {ex.category}
                 </span>
                 {isBookmarked && (
                   <div className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-sm">
                     <Bookmark size={12} className="fill-black" />
                   </div>
                 )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2">{ex.title}</h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">{ex.artist}</p>
                <div className="mt-auto flex items-center justify-between">
                   <span className="text-[10px] text-gray-400">{ex.location.split(' · ')[0]}</span>
                   <button 
                     onClick={(e) => onToggleBookmark(e, ex.id)}
                     className="text-gray-300 hover:text-black"
                   >
                     <Bookmark size={14} className={isBookmarked ? "fill-black text-black" : ""} />
                   </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailView({ 
    exhibition, 
    user, 
    onBack, 
    onAddComment,
    onLoginReq,
    onToggleBookmark,
    onImageError
}: { 
    exhibition: Exhibition, 
    user: User | null, 
    onBack: () => void, 
    onAddComment: (id: string, c: Comment) => void,
    onLoginReq: () => void,
    onToggleBookmark: (e: React.MouseEvent, id: string) => void,
    onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const isBookmarked = user?.bookmarkedExhibitionIds.includes(exhibition.id) || false;

  const handleAiInsight = async () => {
    setIsAiLoading(true);
    const insight = await generateCuratorInsight(exhibition);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  const submitComment = () => {
    if (!user) {
        onLoginReq();
        return;
    }
    if (!commentText.trim() || userRating === 0) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating: userRating,
      text: commentText,
      date: '剛剛'
    };

    onAddComment(exhibition.id, newComment);
    setCommentText("");
    setUserRating(0);
  };

  return (
    <div className="bg-white min-h-screen animate-in slide-in-from-bottom-10 duration-300 relative z-50 pb-20">
      
      {/* Navbar for Detail */}
      <div className="fixed top-0 left-0 w-full z-10 p-4 flex justify-between items-start pointer-events-none">
        <button 
          onClick={onBack} 
          className="bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm text-black hover:bg-white pointer-events-auto transition-transform active:scale-95 border border-gray-100/50"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2 pointer-events-auto">
             <button className="bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm text-black hover:bg-white transition-transform active:scale-95 border border-gray-100/50">
                <Share2 size={20} />
             </button>
             <button 
                onClick={(e) => onToggleBookmark(e, exhibition.id)}
                className="bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm text-black hover:bg-white transition-transform active:scale-95 border border-gray-100/50"
             >
                <Bookmark size={20} className={isBookmarked ? "fill-black" : ""} />
             </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[50vh]">
        <img 
            src={exhibition.imageUrl} 
            alt={exhibition.title} 
            className="w-full h-full object-cover"
            onError={onImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
           <div className="flex gap-2 mb-3">
             <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold">{exhibition.category}</span>
             <span className={`bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold ${exhibition.priceMode === 'free' ? 'text-green-300' : 'text-amber-300'}`}>
                {exhibition.priceMode === 'free' ? '免費參觀' : '售票入場'}
             </span>
           </div>
           <h1 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-2">{exhibition.title}</h1>
           <p className="text-white/80 font-medium">{exhibition.artist}</p>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-6 py-8 -mt-6 rounded-t-3xl bg-white relative">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-1">
                <Calendar size={20} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-bold uppercase">展覽期間</span>
                <span className="text-sm font-medium">{exhibition.dateRange}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-1">
                <MapPin size={20} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-bold uppercase">地點</span>
                <span className="text-sm font-medium truncate">{exhibition.location}</span>
            </div>
        </div>

        {/* AI Insight Section */}
        <div className="mb-8 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
           <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
               <Sparkles size={18} className="text-indigo-600" />
               <span className="font-bold text-indigo-900 text-sm">AI 策展人觀點</span>
             </div>
             {!aiInsight && (
               <button 
                 onClick={handleAiInsight} 
                 disabled={isAiLoading}
                 className="text-xs bg-white px-3 py-1.5 rounded-full text-indigo-600 font-bold shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50"
               >
                 {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : "生成解說"}
               </button>
             )}
           </div>
           {aiInsight ? (
              <p className="text-sm text-indigo-800 leading-relaxed font-serif italic animate-in fade-in">
                "{aiInsight}"
              </p>
           ) : (
              <p className="text-xs text-indigo-400">點擊按鈕，讓 AI 為您解析這場展覽的獨特之處。</p>
           )}
        </div>

        {/* Description */}
        <div className="mb-8">
           <h3 className="text-lg font-bold mb-3 font-serif">展覽介紹</h3>
           <p className="text-gray-600 leading-relaxed text-sm text-justify">
             {exhibition.description}
           </p>
           <div className="mt-4 flex flex-wrap gap-2">
             {exhibition.tags.map(tag => (
               <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">#{tag}</span>
             ))}
           </div>
        </div>

        <div className="mb-8">
            <a href={exhibition.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="font-bold text-sm">前往官方網站購票/詳情</span>
                <ExternalLink size={16} className="text-gray-400" />
            </a>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-100 pt-8">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-serif">觀展評論 ({exhibition.comments.length})</h3>
              <div className="flex items-center gap-1">
                 <StarRating rating={exhibition.rating} size={14} />
                 <span className="text-sm font-bold ml-1">{exhibition.rating.toFixed(1)}</span>
              </div>
           </div>
           
           {/* Comment Input */}
           <div className="mb-8 bg-gray-50 p-4 rounded-2xl">
              {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                        <img src={user.avatar} className="w-8 h-8 rounded-full" alt="User" />
                        <span className="text-sm font-bold text-gray-700">{user.name}</span>
                        <div className="ml-auto">
                            <StarRating rating={userRating} setRating={setUserRating} interactive size={18} />
                        </div>
                    </div>
                    <div className="relative">
                        <textarea 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="分享你的觀展心得..."
                            className="w-full bg-white border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black min-h-[80px] resize-none pr-10"
                        />
                        <button 
                            onClick={submitComment}
                            disabled={!commentText.trim() || userRating === 0}
                            className="absolute bottom-3 right-3 text-black disabled:text-gray-300 hover:scale-110 transition-transform"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                  </>
              ) : (
                  <div onClick={onLoginReq} className="text-center py-4 cursor-pointer">
                      <p className="text-sm text-gray-500 font-medium">登入後即可發表評論</p>
                  </div>
              )}
           </div>

           {/* Comments List */}
           <div className="space-y-6">
              {exhibition.comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                     <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
                     成為第一個評論的人吧！
                  </div>
              ) : (
                  exhibition.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                          <img src={comment.userAvatar} className="w-9 h-9 rounded-full bg-gray-200 object-cover" alt={comment.userName} />
                          <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-sm font-bold">{comment.userName}</span>
                                  <span className="text-[10px] text-gray-400">{comment.date}</span>
                              </div>
                              <div className="flex mb-2">
                                  <StarRating rating={comment.rating} size={10} />
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-r-2xl rounded-bl-2xl">
                                  {comment.text}
                              </p>
                          </div>
                      </div>
                  ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLogin, onCancel }: { onLogin: () => void, onCancel: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 animate-in fade-in duration-300">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
           <Logo className="w-16 h-16 mx-auto mb-4" size="large" />
           <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">歡迎回來</h1>
           <p className="text-gray-500">登入 Mostra，收藏你的藝術足跡</p>
        </div>

        <div className="space-y-4">
           <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 cursor-not-allowed opacity-60">
              <div className="w-6 h-6 rounded-full bg-gray-200"></div>
              <span className="text-sm font-bold text-gray-500">使用 Google 帳號登入 (Demo)</span>
           </div>
           
           <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">或</span>
                <div className="flex-grow border-t border-gray-200"></div>
           </div>

           <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
              <input 
                 type="email" 
                 defaultValue="ming@example.com"
                 className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-black"
                 placeholder="Email"
              />
              <input 
                 type="password" 
                 defaultValue="password"
                 className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-black"
                 placeholder="Password"
              />
              <button 
                type="submit"
                className="w-full bg-black text-white p-4 rounded-xl font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform"
              >
                登入
              </button>
           </form>
        </div>
        
        <button onClick={onCancel} className="mt-8 text-sm text-gray-400 w-full text-center hover:text-black">
            暫時略過
        </button>
      </div>
    </div>
  );
}

function ProfileView({ user, onLogout }: { user: User, onLogout: () => void }) {
  return (
    <div className="px-4 py-8 animate-in fade-in duration-500">
       <div className="flex items-center gap-4 mb-8">
          <img src={user.avatar} className="w-20 h-20 rounded-full border-2 border-white shadow-md" alt={user.name} />
          <div>
             <h1 className="text-2xl font-serif font-bold">{user.name}</h1>
             <p className="text-sm text-gray-500">{user.email}</p>
             <div className="flex gap-2 mt-2">
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">Pro 會員</span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">等級 3</span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <span className="block text-2xl font-bold font-serif mb-1">{user.bookmarkedExhibitionIds.length}</span>
              <span className="text-xs text-gray-400 font-bold uppercase">收藏展覽</span>
           </div>
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <span className="block text-2xl font-bold font-serif mb-1">12</span>
              <span className="text-xs text-gray-400 font-bold uppercase">已評論</span>
           </div>
       </div>

       <div className="space-y-2">
           <button className="w-full bg-white p-4 rounded-xl text-left font-bold text-sm border border-gray-100 flex justify-between items-center group active:scale-[0.98] transition-transform">
               <span>編輯個人檔案</span>
               <ArrowRight size={16} className="text-gray-300 group-hover:text-black" />
           </button>
           <button className="w-full bg-white p-4 rounded-xl text-left font-bold text-sm border border-gray-100 flex justify-between items-center group active:scale-[0.98] transition-transform">
               <span>通知設定</span>
               <ArrowRight size={16} className="text-gray-300 group-hover:text-black" />
           </button>
           <button className="w-full bg-white p-4 rounded-xl text-left font-bold text-sm border border-gray-100 flex justify-between items-center group active:scale-[0.98] transition-transform">
               <span>關於 Mostra</span>
               <ArrowRight size={16} className="text-gray-300 group-hover:text-black" />
           </button>
       </div>

       <button 
         onClick={onLogout}
         className="w-full mt-8 p-4 rounded-xl text-red-500 bg-red-50 font-bold text-sm hover:bg-red-100 transition-colors"
       >
         登出帳號
       </button>
    </div>
  );
}

function SubmitView({ user, onSubmit, onCancel }: { user: User, onSubmit: (ex: Exhibition) => void, onCancel: () => void }) {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("藝廊");

  const handleSmartFill = async () => {
    if (!idea.trim()) return;
    setIsProcessing(true);
    const result = await enhanceExhibitionDraft(idea);
    setTitle(result.title);
    setDescription(result.description);
    setIsProcessing(false);
    setStep(2);
  };

  const handleFinalSubmit = () => {
    const newExhibition: Exhibition = {
      id: `u-${Date.now()}`,
      title,
      description,
      artist: user.name, // Self-curated
      dateRange: '2024/09/01 - 2024/10/01', // Mock
      location: location || '台北市',
      category,
      type: 'minor',
      priceMode: 'free',
      imageUrl: 'https://images.unsplash.com/photo-1505567745926-ba89000d255a?q=80&w=800&auto=format&fit=crop', // Mock image
      tags: ['使用者投稿', '新展訊'],
      rating: 0,
      comments: [],
      sourceUrl: '',
      bookmarksCount: 0
    };
    onSubmit(newExhibition);
  };

  return (
    <div className="px-4 py-8 animate-in slide-in-from-bottom-5 duration-300">
       <div className="flex justify-between items-center mb-8">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-black"><X size={24} /></button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">發布展訊 {step}/2</span>
          <div className="w-8"></div>
       </div>

       {step === 1 ? (
         <>
            <h1 className="text-3xl font-serif font-bold mb-4">你想分享什麼展覽？</h1>
            <p className="text-gray-500 mb-8">簡單描述展覽內容，AI 助手會幫你生成吸引人的標題與介紹。</p>
            
            <textarea 
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full bg-gray-50 border-0 rounded-2xl p-5 text-lg min-h-[200px] focus:ring-2 focus:ring-black mb-6"
              placeholder="例如：在華山文創園區的一個關於貓咪的攝影展，有很多可愛的照片..."
            />

            <button 
               onClick={handleSmartFill}
               disabled={!idea.trim() || isProcessing}
               className="w-full bg-black text-white p-4 rounded-xl font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
               {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
               {isProcessing ? "AI 正在思考..." : "下一步：AI 智慧填寫"}
            </button>
            
            <button 
              onClick={() => setStep(2)} 
              className="w-full mt-4 py-3 text-sm text-gray-400 font-bold hover:text-black"
            >
              跳過 AI，手動填寫
            </button>
         </>
       ) : (
         <div className="space-y-5 animate-in fade-in slide-in-from-right-10 duration-300">
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">展覽標題</label>
               <input 
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="w-full bg-gray-50 border-0 rounded-xl p-4 font-bold"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">展覽介紹</label>
               <textarea 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full bg-gray-50 border-0 rounded-xl p-4 min-h-[120px]"
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">地點</label>
                  <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例如：台北市"
                    className="w-full bg-gray-50 border-0 rounded-xl p-4"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">分類</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 appearance-none"
                  >
                     <option>藝廊</option>
                     <option>博物館</option>
                     <option>文創園區</option>
                     <option>校園展</option>
                  </select>
               </div>
            </div>

            <button 
               onClick={handleFinalSubmit}
               className="w-full bg-black text-white p-4 rounded-xl font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform mt-8"
            >
               確認發布
            </button>
         </div>
       )}
    </div>
  );
}
