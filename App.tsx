import React, { useState, useEffect } from 'react';
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
  Tent, // Icon for Small Exhibitions
  Coffee,
  BookOpen,
  School
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
    category: '親子互動',
    type: 'major',
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
    category: '親子互動',
    type: 'major',
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
    category: '親子互動',
    type: 'major',
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
    category: '親子互動',
    type: 'major',
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
    description: '以材質為導向的雕塑展。藝術家利用自然的木頭與石頭，保留材質本身的紋理，創作出充滿禪意的作品。',
    location: '台北市 · 大安區',
    category: '藝廊',
    type: 'minor',
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
  
  // UI State
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Derived State
  const activeExhibition = exhibitions.find(e => e.id === selectedExhibitionId);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handlers
  const handleLogin = () => {
    setUser(MOCK_USER);
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
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full relative"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white"></span>
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

            {/* 2. Collections */}
            <button 
              onClick={() => setView('collections')}
              className={`flex flex-col items-center justify-center gap-1 ${view === 'collections' ? 'text-black' : 'text-gray-400'}`}
            >
              <Bookmark size={22} strokeWidth={view === 'collections' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">收藏</span>
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

            {/* 4. Small Exhibitions (Formerly Categories) */}
             <button 
              onClick={() => setView('small_exhibitions')}
              className={`flex flex-col items-center justify-center gap-1 ${view === 'small_exhibitions' ? 'text-black' : 'text-gray-400'}`}
            >
              <Tent size={22} strokeWidth={view === 'small_exhibitions' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">小展</span>
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
  onImageError
}: { 
  exhibitions: Exhibition[], 
  user: User | null,
  onSelect: (id: string) => void,
  onToggleBookmark: (e: React.MouseEvent, id: string) => void,
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  // Filter for MAJOR exhibitions only
  const majorExhibitions = exhibitions.filter(ex => ex.type === 'major');

  return (
    <div className="animate-in fade-in duration-500 pb-4">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-serif font-bold text-gray-900">必看大展</h1>
        <p className="text-gray-500 text-sm mt-1">博物館與美術館的年度精選</p>
      </div>
      
      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
        {majorExhibitions.map((ex) => {
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
                
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                  <StarRating rating={ex.rating} size={12} />
                  <span className="text-xs font-bold ml-1">{ex.rating.toFixed(1)}</span>
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
        })}
      </div>
    </div>
  );
}

// Replaces CategoriesView with SmallExhibitionsView
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter for MINOR exhibitions
  const minorExhibitions = exhibitions.filter(ex => ex.type === 'minor');

  // Tags suitable for small exhibitions
  const tags = [
    { name: '藝廊', icon: <Palette size={20} /> },
    { name: '書店', icon: <BookOpen size={20} /> },
    { name: '校園展', icon: <School size={20} /> },
    { name: '咖啡廳', icon: <Coffee size={20} /> },
    { name: '複合空間', icon: <Grid size={20} /> },
    { name: '實驗藝術', icon: <Sparkles size={20} /> },
  ];

  const filteredExhibitions = selectedTag 
    ? minorExhibitions.filter(ex => ex.category === selectedTag || ex.tags.includes(selectedTag))
    : minorExhibitions;

  return (
    <div className="animate-in fade-in duration-500 pb-4">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-serif font-bold text-gray-900">探索小展</h1>
        <p className="text-gray-500 text-sm mt-1">藝廊、獨立空間與巷弄裡的驚喜</p>
      </div>

      {/* Tags Scroll */}
      <div className="px-4 overflow-x-auto no-scrollbar mb-6">
        <div className="flex gap-3 pb-2">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${!selectedTag ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
          >
             <span className="text-xs font-bold">全部小展</span>
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

      {/* List */}
      <div className="px-4 flex flex-col gap-4">
         {filteredExhibitions.length === 0 ? (
           <div className="text-center py-12 text-gray-400 text-sm">此分類目前沒有展覽</div>
         ) : (
           filteredExhibitions.map(ex => {
              const isBookmarked = user?.bookmarkedExhibitionIds.includes(ex.id) || false;
              return (
                <div 
                  key={ex.id} 
                  onClick={() => onSelect(ex.id)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex h-32 cursor-pointer active:scale-[0.99] transition-transform"
                >
                   <div className="w-32 bg-gray-200 shrink-0">
                      <img 
                        src={ex.imageUrl} 
                        className="w-full h-full object-cover" 
                        onError={onImageError}
                      />
                   </div>
                   <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium inline-block">{ex.category}</span>
                          <StarRating rating={ex.rating} size={10} />
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-0.5">{ex.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{ex.artist}</p>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1 text-xs text-gray-400">
                           <MapPin size={10} />
                           <span className="truncate max-w-[8rem]">{ex.location.split(' · ')[1] || ex.location}</span>
                         </div>
                         <button onClick={(e) => onToggleBookmark(e, ex.id)}>
                            <Bookmark size={16} className={isBookmarked ? "fill-black text-black" : "text-gray-300"} />
                         </button>
                      </div>
                   </div>
                </div>
              );
           })
         )}
      </div>
    </div>
  );
}

// ... CollectionsView, DetailView, LoginView, ProfileView remain mostly the same ...
// Including them to ensure full file integrity if user copy-pastes everything

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Bookmark size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold font-serif mb-2">登入以查看收藏</h2>
        <p className="text-gray-500 text-sm mb-6">建立您的專屬展覽清單，隨時回顧精彩內容。</p>
        <button onClick={onLoginReq} className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-black/20">
          立即登入
        </button>
      </div>
    );
  }

  const bookmarkedExhibitions = exhibitions.filter(ex => user.bookmarkedExhibitionIds.includes(ex.id));

  return (
    <div className="animate-in fade-in duration-500 pb-4">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-serif font-bold text-gray-900">我的收藏</h1>
        <p className="text-gray-500 text-sm mt-1">共收藏 {bookmarkedExhibitions.length} 個展覽</p>
      </div>

      {bookmarkedExhibitions.length === 0 ? (
         <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8">
            <p className="text-gray-400 mb-4">您的收藏清單還是空的</p>
            <button onClick={onGoHome} className="text-black font-bold text-sm border-b border-black pb-0.5">前往探索展覽</button>
         </div>
      ) : (
        <div className="flex flex-col gap-4 px-4">
          {bookmarkedExhibitions.map(ex => (
            <div 
              key={ex.id} 
              onClick={() => onSelect(ex.id)}
              className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-4 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={ex.imageUrl} 
                  className="w-full h-full object-cover" 
                  onError={onImageError}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">{ex.title}</h3>
                  <p className="text-xs text-gray-500">{ex.artist}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex items-center gap-1 text-xs text-gray-400">
                      <StarRating rating={ex.rating} size={10} />
                      <span className="font-bold ml-0.5">{ex.rating.toFixed(1)}</span>
                   </div>
                   <button 
                     onClick={(e) => onToggleBookmark(e, ex.id)}
                     className="p-2 -mr-2 text-black hover:bg-gray-100 rounded-full"
                   >
                     <Bookmark size={18} className="fill-black" />
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
  onAddComment: (id: string, comment: Comment) => void,
  onLoginReq: () => void,
  onToggleBookmark: (e: React.MouseEvent, id: string) => void,
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const isBookmarked = user?.bookmarkedExhibitionIds.includes(exhibition.id) || false;

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const insight = await generateCuratorInsight(exhibition);
    setAiInsight(insight);
    setIsLoadingAi(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: exhibition.title,
          text: `推薦這個展覽給你：${exhibition.title} @ ${exhibition.artist}\n${exhibition.description}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      alert('您的瀏覽器不支援原生分享功能');
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    if (!user) {
      onLoginReq();
      return;
    }

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
    setCommentText('');
    setUserRating(5);
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 bg-white min-h-screen pb-20">
      <div className="relative h-64 md:h-96 w-full">
         <img 
            src={exhibition.imageUrl} 
            alt={exhibition.title} 
            className="w-full h-full object-cover" 
            onError={onImageError}
         />
         <button onClick={onBack} className="absolute top-safe-top left-4 mt-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors z-10">
           <ChevronLeft size={24} className="text-black" />
         </button>
         
         <div className="absolute -bottom-6 right-6 z-10 flex gap-3">
           <button 
             onClick={handleShare}
             className="w-12 h-12 bg-white text-black rounded-full shadow-lg shadow-black/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
           >
              <Share2 size={20} />
           </button>
           
           <button 
             onClick={(e) => onToggleBookmark(e, exhibition.id)}
             className="w-12 h-12 bg-black text-white rounded-full shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
           >
              <Bookmark size={20} className={isBookmarked ? "fill-white" : ""} />
           </button>
         </div>
      </div>

      <div className="px-5 pt-10 pb-8">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
             <span className="px-2.5 py-1 bg-black text-white rounded-full text-xs font-medium">{exhibition.category}</span>
             {exhibition.tags.map(tag => (
               <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{tag}</span>
             ))}
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2 leading-tight">{exhibition.title}</h1>
          <p className="text-lg text-gray-500 font-medium">{exhibition.artist}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
           <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-gray-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase">展覽期間</span>
                <span className="text-sm font-medium">{exhibition.dateRange}</span>
              </div>
           </div>
           <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={20} className="text-gray-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase">地點</span>
                <span className="text-sm font-medium">{exhibition.location}</span>
              </div>
           </div>
           {exhibition.sourceUrl && (
             <a 
               href={exhibition.sourceUrl} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 active:bg-blue-100 transition-colors"
             >
                <Info size={20} className="text-blue-500" />
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-blue-400 font-bold uppercase">資料來源</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-blue-700">前往官方網站/社群</span>
                    <ExternalLink size={12} className="text-blue-700" />
                  </div>
                </div>
             </a>
           )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <Sparkles size={16} />
              <h3>AI 策展人觀點</h3>
            </div>
            {!aiInsight && !isLoadingAi && (
              <button 
                onClick={handleGenerateInsight}
                className="text-xs bg-purple-600 text-white px-4 py-1.5 rounded-full font-medium hover:bg-purple-700 transition-colors active:scale-95"
              >
                生成解析
              </button>
            )}
          </div>
          
          {isLoadingAi ? (
            <div className="flex justify-center py-4">
              <Loader2 size={24} className="animate-spin text-purple-300" />
            </div>
          ) : aiInsight ? (
            <p className="text-purple-900/80 text-sm leading-relaxed text-justify">
              {aiInsight}
            </p>
          ) : (
            <p className="text-purple-400 text-xs">不知道該不該看展？讓 AI 為您提供專業導讀。</p>
          )}
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3">展覽介紹</h3>
          <p className="text-gray-700 leading-relaxed text-base text-justify whitespace-pre-wrap">{exhibition.description}</p>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            觀眾評論 
            <span className="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full">{exhibition.comments.length}</span>
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
             {user ? (
               <form onSubmit={handleSubmitComment}>
                 <div className="mb-3 flex items-center justify-between">
                   <label className="text-xs font-bold text-gray-500 uppercase">您的評分</label>
                   <StarRating rating={userRating} setRating={setUserRating} interactive size={20} />
                 </div>
                 <div className="relative">
                   <textarea
                     className="w-full p-3 pr-10 rounded-lg border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none resize-none h-20 text-sm bg-white"
                     placeholder="寫下您的觀展心得..."
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                   ></textarea>
                   <button 
                      type="submit" 
                      disabled={!commentText.trim()}
                      className="absolute bottom-2 right-2 p-1.5 bg-black text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <Send size={14} />
                   </button>
                 </div>
               </form>
             ) : (
               <div className="flex flex-col items-center py-3 gap-2">
                 <p className="text-gray-500 text-sm">登入後即可發表評論</p>
                 <button onClick={onLoginReq} className="text-xs font-bold bg-white border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50">
                    前往登入
                 </button>
               </div>
             )}
          </div>

          <div className="space-y-5">
            {exhibition.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover border border-gray-200 mt-1" />
                <div className="flex-1">
                  <div className="bg-gray-50/50 p-3 rounded-xl rounded-tl-none border border-gray-50">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-xs text-gray-900">{comment.userName}</span>
                       <span className="text-[10px] text-gray-400">{comment.date}</span>
                     </div>
                     <div className="mb-1"><StarRating rating={comment.rating} size={10} /></div>
                     <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLogin, onCancel }: { onLogin: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 animate-in zoom-in-95 duration-300 -mt-20">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <Logo className="w-24 h-24 mx-auto mb-6" size="large" />
          <h2 className="text-2xl font-bold font-serif mb-2">歡迎回來</h2>
          <p className="text-gray-500 text-sm">登入 Mostra，開啟您的藝術旅程</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              defaultValue="ming@example.com"
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black outline-none text-sm transition-all"
              placeholder="電子郵件"
            />
          </div>
          <div>
            <input 
              type="password" 
              defaultValue="password"
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black outline-none text-sm transition-all"
              placeholder="密碼"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/20"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : '登入帳號'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button onClick={onCancel} className="text-sm text-gray-400 hover:text-black transition-colors">先隨便逛逛</button>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user, onLogout }: { user: User, onLogout: () => void }) {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm text-center">
                <div className="relative inline-block mb-4">
                    <img src={user.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50" />
                    <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                </div>
                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-gray-400 text-sm mb-6">{user.email}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="block text-xl font-bold">{user.bookmarkedExhibitionIds.length}</span>
                        <span className="text-xs text-gray-500">收藏展覽</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="block text-xl font-bold">5</span>
                        <span className="text-xs text-gray-500">發表評論</span>
                    </div>
                </div>

                <button 
                    onClick={onLogout}
                    className="w-full py-3 rounded-xl border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 flex items-center justify-center gap-2"
                >
                    <LogIn size={16} className="rotate-180" />
                    登出帳號
                </button>
            </div>
        </div>
    )
}

function SubmitView({ user, onSubmit, onCancel }: { user: User, onSubmit: (ex: Exhibition) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    location: '',
    category: '藝廊',
    imageUrl: '',
    dateRange: '',
    sourceUrl: ''
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAiAutoFill = async () => {
    if (!formData.description) return;
    setAiGenerating(true);
    const result = await enhanceExhibitionDraft(formData.description);
    setFormData(prev => ({
      ...prev,
      title: result.title,
      description: result.description
    }));
    setAiGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExhibition: Exhibition = {
      id: Date.now().toString(),
      ...formData,
      type: 'minor', // User submissions default to minor for now
      tags: ['網友推薦', '最新展訊'],
      comments: [],
      rating: 0,
      imageUrl: formData.imageUrl || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/800/600`,
      sourceUrl: formData.sourceUrl || '',
      bookmarksCount: 0
    };
    onSubmit(newExhibition);
  };

  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-bottom-20 duration-500 pb-20">
      <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 px-4 pb-4 flex items-center justify-between z-10 safe-top pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <button onClick={onCancel} className="text-base font-medium text-gray-500">取消</button>
        <h1 className="font-bold text-xl">提交展訊</h1>
        <button 
          onClick={handleSubmit} 
          form="submit-form"
          className="text-base font-bold text-blue-600"
        >
          發布
        </button>
      </div>

      <div className="p-5">
        <form id="submit-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">展覽標題</label>
               <input 
                 required
                 className="w-full text-lg font-bold border-b border-gray-200 py-2 focus:border-black outline-none rounded-none placeholder:text-gray-300"
                 placeholder="輸入標題"
                 value={formData.title}
                 onChange={e => setFormData({...formData, title: e.target.value})}
               />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">藝術家 / 單位</label>
               <input 
                 required
                 className="w-full text-base border-b border-gray-200 py-2 focus:border-black outline-none rounded-none placeholder:text-gray-300"
                 placeholder="例如：亞紀畫廊"
                 value={formData.artist}
                 onChange={e => setFormData({...formData, artist: e.target.value})}
               />
             </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
             <div className="flex justify-between items-center mb-2">
               <label className="text-xs font-bold text-gray-500 uppercase">展覽介紹</label>
               <button 
                type="button" 
                onClick={handleAiAutoFill}
                disabled={!formData.description || aiGenerating}
                className="text-[10px] flex items-center gap-1 text-purple-600 bg-white border border-purple-100 px-2 py-1 rounded-full shadow-sm active:scale-95 transition-transform"
               >
                 {aiGenerating ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10} />}
                 AI 優化文案
               </button>
             </div>
             <textarea 
                required
                className="w-full bg-transparent border-0 p-0 text-sm h-32 resize-none focus:ring-0 placeholder:text-gray-400"
                placeholder="簡單描述展覽內容，AI 可以幫您修飾得更好..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">地點</label>
              <input 
                required
                className="input-base"
                placeholder="城市, 館名"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">日期</label>
              <input 
                required
                className="input-base"
                placeholder="YYYY/MM/DD"
                value={formData.dateRange}
                onChange={e => setFormData({...formData, dateRange: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">分類</label>
            <select 
              className="input-base"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="藝廊">藝廊</option>
              <option value="複合空間">複合空間</option>
              <option value="實驗藝術">實驗藝術</option>
              <option value="書店">書店</option>
              <option value="咖啡廳">咖啡廳</option>
              <option value="校園展">校園展</option>
              <option value="美術館">美術館</option>
              <option value="博物館">博物館</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">資料來源網址</label>
            <input 
              required
              type="url"
              className="input-base"
              placeholder="https://..."
              value={formData.sourceUrl}
              onChange={e => setFormData({...formData, sourceUrl: e.target.value})}
            />
          </div>

          <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">封面圖片網址 (選填)</label>
              <input 
                className="input-base"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              />
          </div>
        </form>
      </div>
      
      <style>{`
        .input-base { width: 100%; padding: 0.75rem; border-radius: 0.75rem; background-color: #f9fafb; border: 1px solid #f3f4f6; font-size: 0.9rem; outline: none; transition: all 0.2s; }
        .input-base:focus { background-color: white; border-color: black; box-shadow: 0 0 0 1px black; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
