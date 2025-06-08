import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  BuildingOffice2Icon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface DiversityHomeData {
  dhome_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
  updated_at: string;
}

interface FTGroupData {
  ft_id: number;
  ft_category: string;
  image_file: string;
  description: string;
  weblink: string;
  home_page: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsData {
  id: number;
  title: string;
  summary: string;
  image_url: string | null;
  created_at: string;
}

const demoNews: NewsData[] = [
  { id: 1, title: "Company Milestone Achieved", summary: "Our company celebrates a major milestone in innovation and growth.", image_url: null, created_at: "2025-06-01T10:00:00Z" },
  { id: 2, title: "New Product Launch", summary: "Introducing our latest product, designed to revolutionize the industry.", image_url: null, created_at: "2025-05-28T12:00:00Z" },
  { id: 3, title: "Community Outreach Program", summary: "We’re proud to support local communities with our new initiative.", image_url: null, created_at: "2025-05-20T09:00:00Z" },
];

// --- Logging Utility ---
const logFrontendEvent = (level: 'info' | 'warn' | 'error', message: string, context: object = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    userId: localStorage.getItem("auth_token") ? 'authenticated' : 'guest',
    ...context,
  };
  switch (level) {
    case 'info':
      console.log(`[INFO] ${message}`, logData);
      break;
    case 'warn':
      console.warn(`[WARN] ${message}`, logData);
      break;
    case 'error':
      console.error(`[ERROR] ${message}`, logData);
      break;
  }
};

// --- Diversity Home Slideshow Component ---
const DiversityHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<DiversityHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiversityHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const context = {
      endpoint: '/api/d-and-inc/homeSlider',
      method: 'GET',
    };

    logFrontendEvent('info', 'Initiating fetch for diversity home entries', context);

    try {
      const authToken = localStorage.getItem("auth_token") || "";
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const response = await axiosInstance.get("/api/d-and-inc/homeSlider", { headers });
      if (Array.isArray(response.data)) {
        setData(response.data);
        logFrontendEvent('info', 'Successfully fetched diversity home entries', {
          ...context,
          count: response.data.length,
          dhome_ids: response.data.map((item: DiversityHomeData) => item.dhome_id),
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      const message =
        "Failed to fetch diversity homes: " +
        (err.response?.data?.message || err.message || "Unknown error");
      setError(message);
      logFrontendEvent('error', 'Error fetching diversity home entries', {
        ...context,
        error: message,
        status: err.response?.status,
      });
      toast.error("Error fetching diversity homes.");
    } finally {
      setLoading(false);
      logFrontendEvent('info', 'Completed fetch attempt for diversity home entries', context);
    }
  }, []);

  useEffect(() => {
    fetchDiversityHomes();
  }, [fetchDiversityHomes]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
      logFrontendEvent('info', 'Advanced to next diversity home slide', {
        slide_index: (currentSlide + 1) % data.length,
        dhome_id: data[(currentSlide + 1) % data.length]?.dhome_id,
      });
    }, 5000);
    return () => {
      clearInterval(interval);
      logFrontendEvent('info', 'Cleared diversity home slideshow interval');
    };
  }, [data.length, currentSlide]);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeInOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.8, ease: "easeInOut" } },
  };
  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  const particleVariants = {
    animate: {
      y: [0, -20, 0],
      opacity: [0.3, 0.9, 0.3],
      scale: [1, 1.4, 1],
      transition: { duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="flex items-center space-x-3 text-2xl font-semibold text-white animate-pulse">
          <ArrowPathIcon className="w-8 h-8 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-600 to-purple-700 p-6">
        <div className="text-rose-300 text-3xl font-bold mb-6 flex items-center space-x-3">
          <InformationCircleIcon className="w-8 h-8" />
          <span>Oops, Something Went Wrong</span>
        </div>
        <p className="text-gray-200 mb-8 text-lg text-center">{error}</p>
        <button
          onClick={() => {
            fetchDiversityHomes();
            logFrontendEvent('info', 'Retry button clicked for diversity home fetch');
          }}
          className="inline-flex items-center px-8 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="text-white text-2xl font-semibold flex items-center space-x-3">
          <InformationCircleIcon className="w-8 h-8" />
          <span>No diversity home entries found.</span>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      {[...Array(30)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 5 + 2}px`,
            height: `${Math.random() * 5 + 2}px`,
          }}
          variants={particleVariants}
          animate="animate"
          initial={{ opacity: 0 }}
        />
      ))}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
          <img
            src={
              data[currentSlide].home_img
                ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img?.replace(/^\//, "")}`
                : "https://via.placeholder.com/1200x600?text=No+Image"
            }
            alt={data[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Error";
              e.currentTarget.alt = "Image load error";
              logFrontendEvent('error', 'Image failed to load in diversity home slideshow', {
                dhome_id: data[currentSlide].dhome_id,
                image_url: data[currentSlide].home_img,
              });
            }}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
        <div className="max-w-[50%] text-left ml-12">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight break-words"
            style={{ color: "#FFC107", textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)" }}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-8 leading-relaxed break-words"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div
            className="flex space-x-4"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => {
                setCurrentSlide((prev) => (prev - 1 + data.length) % data.length);
                logFrontendEvent('info', 'Previous slide button clicked', {
                  slide_index: (currentSlide - 1 + data.length) % data.length,
                  dhome_id: data[(currentSlide - 1 + data.length) % data.length]?.dhome_id,
                });
              }}
              className="inline-flex items-center px-5 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Previous
            </button>
            <button
              onClick={() => {
                setCurrentSlide((prev) => (prev + 1) % data.length);
                logFrontendEvent('info', 'Next slide button clicked', {
                  slide_index: (currentSlide + 1) % data.length,
                  dhome_id: data[(currentSlide + 1) % data.length]?.dhome_id,
                });
              }}
              className="inline-flex items-center px-5 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Next slide"
            >
              Next
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- FTGroup Section Component ---
const FTGroupSection: React.FC = () => {
  const [ftGroup, setFTGroup] = useState<FTGroupData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFTGroup = useCallback(async () => {
    setLoading(true);
    const context = {
      endpoint: '/api/latest/ft-groups',
      method: 'GET',
    };

    logFrontendEvent('info', 'Initiating fetch for featured group', context);

    try {
      const authToken = localStorage.getItem("auth_token") || "";
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const response = await axiosInstance.get("/api/latest/ft-groups", { headers });
      if (response.data.ft_group) {
        setFTGroup(response.data.ft_group);
        logFrontendEvent('info', 'Successfully fetched featured group', {
          ...context,
          ft_id: response.data.ft_group.ft_id,
          ft_category: response.data.ft_group.ft_category,
        });
      }
    } catch (err: any) {
      logFrontendEvent('warn', 'Could not fetch featured group', {
        ...context,
        error: err.message,
        status: err.response?.status,
      });
      toast.warn("Could not fetch featured group.");
    } finally {
      setLoading(false);
      logFrontendEvent('info', 'Completed fetch attempt for featured group', context);
    }
  }, []);

  useEffect(() => {
    fetchFTGroup();
  }, [fetchFTGroup]);

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
        <BuildingOffice2Icon className="w-8 h-8 mr-3 text-indigo-600" />
        Featured Group
      </h2>
      {loading ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading Group...</div>
      ) : ftGroup ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col h-full"
        >
          <img
            src={
              ftGroup.image_file
                ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${ftGroup.image_file?.replace(/^\//, "")}`
                : "https://via.placeholder.com/300x150?text=No+Image"
            }
            alt={ftGroup.ft_category}
            className="w-full h-40 object-cover rounded-md mb-4"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/300x150?text=Error";
              e.currentTarget.alt = "Image load error";
              logFrontendEvent('error', 'Image failed to load in featured group', {
                ft_id: ftGroup.ft_id,
                image_url: ftGroup.image_file,
              });
            }}
            loading="lazy"
          />
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{ftGroup.ft_category}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed flex-grow">
            {ftGroup.description.length > 120 ? `${ftGroup.description.slice(0, 120)}...` : ftGroup.description}
          </p>
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/company/ft-group"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => logFrontendEvent('info', 'Clicked Learn More for featured group', { ft_id: ftGroup.ft_id })}
            >
              Learn More
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">No featured group found.</div>
      )}
    </div>
  );
};

// --- News Section Component ---
const NewsSection: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsData[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    const context = {
      endpoint: '/api/news',
      method: 'GET',
    };

    logFrontendEvent('info', 'Initiating fetch for news', context);

    try {
      const authToken = localStorage.getItem("auth_token") || "";
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const response = await axiosInstance.get<NewsData[]>("/api/news", { headers });
      setNewsData(response.data.slice(0, 3));
      logFrontendEvent('info', 'Successfully fetched news', {
        ...context,
        count: response.data.length,
        news_ids: response.data.map((item: NewsData) => item.id),
      });
    } catch (err: any) {
      setNewsData(demoNews);
      logFrontendEvent('warn', 'Could not fetch latest news, using demo content', {
        ...context,
        error: err.message,
        status: err.response?.status,
      });
      toast.warn("Could not fetch latest news. Showing demo content.");
    } finally {
      setNewsLoading(false);
      logFrontendEvent('info', 'Completed fetch attempt for news', context);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const newsCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <>
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10 text-center flex items-center justify-center space-x-3">
        <NewspaperIcon className="w-8 h-8 text-indigo-600" />
        <span>Latest News</span>
      </h2>
      {newsLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex items-center space-x-3 text-xl font-semibold text-gray-600 dark:text-gray-300 animate-pulse">
            <ArrowPathIcon className="w-6 h-6 animate-spin" />
            <span>Loading News...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsData.map((news, index) => (
            <motion.div
              key={news.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              variants={newsCardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={
                  news.image_url
                    ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${news.image_url?.replace(/^\//, "")}`
                    : "https://via.placeholder.com/400x200?text=News"
                }
                alt={news.title}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400x200?text=Error";
                  e.currentTarget.alt = "Image load error";
                  logFrontendEvent('error', 'Image failed to load in news section', {
                    news_id: news.id,
                    image_url: news.image_url,
                  });
                }}
                loading="lazy"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{news.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {news.summary.length > 120 ? `${news.summary.slice(0, 120)}...` : news.summary}
                </p>
                <p className="text-gray-500 dark:text-gray-300 text-xs">
                  {new Date(news.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};

// --- Main DiversityHomePage Component ---
const DiversityHomePage: React.FC = () => {
  return (
    <div className="w-full font-sans">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <DiversityHomeSlideshow />
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <FTGroupSection />
            </div>
            <div className="lg:col-span-2">
              <NewsSection />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiversityHomePage;