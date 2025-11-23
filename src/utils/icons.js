// Icon utility - centralized icon imports
import { 
  HiHome, 
  HiBookOpen, 
  HiChartBar, 
  HiCog,
  HiUser,
  HiCheckCircle,
  HiClock,
  HiTrendingUp,
  HiLightBulb,
  HiFire,
  HiStar,
  HiAcademicCap,
  HiSparkles,
  HiPlus
} from 'react-icons/hi'

import {
  FiBook,
  FiBarChart2,
  FiAward,
  FiSettings,
  FiUser
} from 'react-icons/fi'

import {
  MdEmojiEvents
} from 'react-icons/md'

export const Icons = {
  // Navigation
  Dashboard: HiHome,
  WordLibrary: HiBookOpen,
  Analytics: HiChartBar,
  Achievements: MdEmojiEvents,
  Settings: HiCog,
  User: HiUser,
  
  // Status & Actions
  Check: HiCheckCircle,
  Clock: HiClock,
  Trending: HiTrendingUp,
  LightBulb: HiLightBulb,
  Plus: HiPlus,
  
  // Special (limited emoji use for achievements)
  Fire: HiFire,
  Star: HiStar,
  Academic: HiAcademicCap,
  Sparkles: HiSparkles,
  
  // Alternative styles
  Book: FiBook,
  Chart: FiBarChart2,
  Award: FiAward,
  Trophy: MdEmojiEvents,
  SettingsAlt: FiSettings,
  UserAlt: FiUser
}

