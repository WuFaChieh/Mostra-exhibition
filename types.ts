
export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  bookmarkedExhibitionIds: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface Exhibition {
  id: string;
  title: string;
  artist: string;
  dateRange: string;
  description: string;
  imageUrl: string;
  location: string;
  category: string;
  type: 'major' | 'minor'; // major (大展) or minor (小展)
  priceMode: 'free' | 'paid'; // New field: free (免費) or paid (售票)
  tags: string[];
  comments: Comment[];
  rating: number;
  sourceUrl: string;
  bookmarksCount: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'success' | 'alert';
}

export type ViewState = 'home' | 'collections' | 'small_exhibitions' | 'detail' | 'login' | 'submit' | 'profile';
