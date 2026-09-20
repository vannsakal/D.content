import React, { useEffect, useMemo, useState } from "react";
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/AuthContext";
import { FaRegUser } from 'react-icons/fa';
import { BsFileBarGraph } from "react-icons/bs";
import { MdAddBusiness } from "react-icons/md";
import { LuNotepadText } from "react-icons/lu";
import { PiShapesBold } from "react-icons/pi";
import { GrDocumentText } from "react-icons/gr";
import { AiOutlineStock } from "react-icons/ai";
import { FiShoppingCart } from "react-icons/fi";
import { MdOutlinePersonAddAlt1 } from "react-icons/md";
import { IoMdMegaphone } from "react-icons/io";
import { FaTiktok } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa6";
import { BsStars } from "react-icons/bs";
import { FaHourglass } from "react-icons/fa6";
import { OrbitProgress } from "react-loading-indicators";
import { FaCheckCircle } from "react-icons/fa";
import { FaRegCircleCheck } from "react-icons/fa6";
import { CircleCheck, Lightbulb,Share2, MapPin, Zap, TrendingUp, Clock, Copy, Check, Link2, UploadCloud, Globe, Archive, X, FileVideo } from "lucide-react";
import { FaYoutube } from "react-icons/fa";





const steps = [
  { key: "purpose", title: "Purpose", label: "What are you creating content for?" },
  { key: "product", title: "Product", label: "Describe the content idea and core objective." },
  { key: "audience", title: "Audience", label: "Who is this content for?" },
  { key: "goal", title: "Goal", label: "What approach should the content take?" },
  { key: "channels", title: "Channels", label: "Which channels should this content target?" },
  { key: "ai", title: "AI Predictor", label: "AI recommendation summary" },
  { key: "review", title: "Review", label: "Review and save your content plan." },
];


const purposeOptions = [
  "Content Creator",
  "Business",
  "Existing Content",
  
];

const categoryOptions = [
  "Apparel & Accessories",
  "Electronics",
  "Personal Care & Beauty",
  "Sports & Outdoor",
  "Toys & Games",
  "Animals & Pet Supplies",
  "Home Goods",
  "Electronics & Gadgets",
  "Toys & Games"
];

const contentTypeOptions = [
  "Short-form video",
  "Carousel posts",
  "Educational content",
  "UGC",
  "Product showcase",
  "News update",
];

const toneOptions = [
  "Confident",
  "Friendly",
  "Professional",
  "Playful",
  "Luxury",
  "Bold",
];

const ctaOptions = [
  "Learn more",
  "Shop now",
  "Book a demo",
  "Sign up",
  "Follow us",
  "DM us",
];

const ageOptions = [
  "Under 18",
  "18-24",
  "25-34",
  "35-44",
  "45+"
];

const genderOptions = [
  "Women",
  "Men",
  "All"
];



const goalOptions = [
  "Maximize Reach",
  "Drive Sales",
  "Increase Followers",
  "Brand Awareness"
]

const channelOptions = [
  "TikTok",
  "Instagram",
  "Facebook",
  
];

const initialPlanData = {
  purpose: {
    objective: "",
    selectedPurpose: "Brand Awareness",
  },
  product: {
    name: "",
    category: "",
    description: "",
  },
  audience: {
    targetAudience: "",
    ageRange: "18-34",
    gender: "All genders",
    location: "",
    interests: "",
    characteristics: "",
  },
  strategy: {
    goal: "",
    contentType: "",
    tone: "",
    keyMessage: "",
    cta: "",
    notes: "",
  },
  channels: ["Instagram", "TikTok"],
};

const predictionProcess = [
  "Understanding Audience",
  "Analyzing Category",
  "Finding Patterns",
  "Generating Ideas",
  "Predicting Engagement",
  "Comparing Platforms",
  "Finding Time",
  "Optimizing Caption/Hashtags"
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSavedPlans() {
  try {
    return JSON.parse(
      localStorage.getItem("meateka_content_plans") || "[]"
    );
  } catch {
    return [];
  }
}

function buildPredictionData(data) {
  const channels = data.channels.length ? data.channels : ["Instagram"];
  const productName = data.product.name || "Your product";
  const audience = data.audience.targetAudience || "Target audience";
  const purpose = data.purpose.objective || "Content strategy";

  return {
    audienceMatch: Math.min(
      97,
      Math.max(74, 82 + (channels.length - 1) * 4)
    ),
    contentPotential: Math.min(
      96,
      Math.max(76, 78 + (productName.length > 10 ? 8 : 4))
    ),
    platformPotential: Math.min(
      95,
      Math.max(72, 70 + channels.length * 6)
    ),
    engagementPotential: Math.min(
      94,
      Math.max(68, 72 + (audience.length > 10 ? 8 : 4))
    ),
    postingTime: "7:00 PM - 9:00 PM",
    recommendation:
      "Focus on short-form storytelling and high-contrast product visuals to maximize reach across your selected channels.",
    summary: `Best performance is expected for ${productName} among ${audience.toLowerCase()} audiences when positioned around ${purpose.toLowerCase()} with a consistent social-first format.`,
  };
}

export default function CreateContent() {
  const navigate = useNavigate();
  const { plan } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputData, setInputData] = useState({
    purpose: "",
    product: "",
    category: "",
    productDescription: "",
    age: "",
    gender: "",
    interests: [],
    audienceDescription: "",
    goal: "",
    channel: "TikTok",
    existingContentUrl: "",
    existingContent: [],
  });
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(0);
  const hasStartedPrediction = React.useRef(false);
  const [recommendationData, setRecommendationData] = useState(null);
  const [createError, setCreateError] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("TikTok");

const toggleChannel = (option) => {
  setSelectedChannels((prev) =>
    prev.includes(option)
      ? prev.filter((item) => item !== option)
      : [...prev, option]
  );
};

  useEffect(() => {
    if (recommendationData?.captions?.[0]?.platform) {
      setActiveTab(recommendationData.captions[0].platform);
    }
  }, [recommendationData]);

  useEffect(() => {
    api.get('/plan/interest')
      .then(({ data }) => {
        const loaded = data.interests || [];
        setInterest(loaded.length > 0 ? loaded : [
          'Technology', 'Fashion', 'Beauty', 'Fitness', 'Food',
          'Travel', 'Gaming', 'Music', 'Art', 'Photography',
          'Sports', 'Education', 'Finance', 'Health', 'Lifestyle',
        ]);
      })
      .catch(() => setInterest([
        'Technology', 'Fashion', 'Beauty', 'Fitness', 'Food',
        'Travel', 'Gaming', 'Music', 'Art', 'Photography',
        'Sports', 'Education', 'Finance', 'Health', 'Lifestyle',
      ]))
      .finally(() => setLoading(false));

      api.get('/recommendation/fetch-data')
        .then(({ data }) => {
          setRecommendationData(data.recommendation || null);
          console.log(recommendationData)
        })
        .catch((err) => console.error('Error fetching recommendation data:', err))
        .finally(() => setLoading(false));

    

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isPremiumPlan = plan === 'premium';

  useEffect(() => {
    if (currentStepConfig.key === 'ai' && !hasStartedPrediction.current) {
      hasStartedPrediction.current = true;
      handleCreate();
    }

    if (currentStepConfig.key !== 'ai') {
      hasStartedPrediction.current = false;
    }
  }, [currentStepConfig.key]);

  function updateInputField(field, value) {
    if (field === 'interests') {
      setInputData((previous) => {
        const current = Array.isArray(previous.interests) ? previous.interests : [];
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];

        return { ...previous, interests: next };
      });
      return;
    }

    setInputData((previous) => ({ ...previous, [field]: value }));
  }

  function detectContentPlatform(url) {
    const lower = url.toLowerCase();
    if (lower.includes('tiktok.com')) return 'TikTok';
    if (lower.includes('instagram.com')) return 'Instagram';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
    return 'Link';
  }

  function handleAddContentUrl() {
    const url = inputData.existingContentUrl.trim();
    if (!url) return;

    const newItem = {
      id: `url-${Date.now()}`,
      type: 'url',
      value: url,
      platform: detectContentPlatform(url),
    };

    setInputData((previous) => ({
      ...previous,
      existingContent: [...(previous.existingContent || []), newItem],
      existingContentUrl: '',
    }));
  }

  function addContentFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const newItems = files.map((file) => ({
      id: `file-${Date.now()}-${file.name}`,
      type: 'file',
      value: file.name,
      fileSize: file.size,
      file,
    }));

    setInputData((previous) => ({
      ...previous,
      existingContent: [...(previous.existingContent || []), ...newItems],
    }));
  }

  function handleContentFileSelect(event) {
    addContentFiles(event.target.files);
    event.target.value = '';
  }

  function handleContentFileDrop(event) {
    event.preventDefault();
    addContentFiles(event.dataTransfer.files);
  }

  function handleRemoveContentItem(id) {
    setInputData((previous) => ({
      ...previous,
      existingContent: (previous.existingContent || []).filter((item) => item.id !== id),
    }));
  }

  function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  function isStepValid() {
    switch (currentStepConfig.key) {
      case 'purpose':
        return Boolean(inputData.purpose);
      case 'product':
        if (inputData.purpose === 'Existing Content') {
          return Array.isArray(inputData.existingContent) && inputData.existingContent.length > 0;
        }
        return Boolean(inputData.product) && Boolean(inputData.category);
      case 'audience':
        return Boolean(inputData.age) && Boolean(inputData.gender) && Array.isArray(inputData.interests) && inputData.interests.length > 0;
      case 'goal':
        return Boolean(inputData.goal);
      case 'channels':
        return Boolean(inputData.channel);
      default:
        return true;
    }
  }

  const handleCreate = async () => {
    if (loading) return;

    setLoading(true);
    setCurrentProcess(0);
    setCreateError('');

    // Field names match the backend's createRecommendation validation
    const payload = {
      plan_purpose: inputData.purpose,
      // "Existing Content" plans skip the product step, so fall back to placeholders
      product_name: inputData.product || 'Existing content',
      product_category: inputData.category || 'Business',
      product_description: inputData.productDescription,
      demographics_age: inputData.age,
      demographics_gender: inputData.gender,
      interests: Array.isArray(inputData.interests)
        ? inputData.interests
        : inputData.interests ? [inputData.interests] : [],
      audience_description: inputData.audienceDescription,
      plan_goal: inputData.goal,
      plan_channel: inputData.channel,
    };

    // Start the request first; the progress steps animate while the AI works.
    // Generation makes several Gemini calls, so allow a long timeout.
    const request = api.post('/recommendation/generate', payload, { timeout: 180000 });
    request.catch(() => {});

    // Cycle through steps repeatedly until the API responds
    let step = 0;
    const animateInterval = setInterval(() => {
      step = (step + 1) % predictionProcess.length;
      setCurrentProcess(step);
    }, 800);

    try {
      const { data } = await request;
      setRecommendationData(data.recommendation || null);
      setCurrentProcess(predictionProcess.length);
    } catch (err) {
      console.error('Create recommendation failed:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error;
      setCreateError(
        typeof errorMsg === 'string' ? errorMsg :
        errorMsg?.message || 'Something went wrong while generating your recommendation.'
      );
    } finally {
      clearInterval(animateInterval);
      setLoading(false);
    }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const draftPlan = {
      id: Date.now(),
      title: `${inputData.product || 'New'} content plan`,
      purpose: inputData.purpose,
      details: inputData.productDescription || 'Content concept planning',
      audience: inputData.age || 'General audience',
      strategy: inputData.goal || 'Audience-first storytelling',
      channels: inputData.channel ? [inputData.channel] : ['Instagram'],
      createdAt: new Date().toLocaleDateString(),
    };

    const savedPlans = getSavedPlans();
    localStorage.setItem('meateka_content_plans', JSON.stringify([draftPlan, ...savedPlans].slice(0, 12)));
    navigate('/plan/my-content', { replace: true });
  }

  function StatCard({ icon, label, value }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #ECEDF3" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, marginBottom: 6 , fontWeight: 600, color: "#555555"}}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#161624", lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 22,
        border: "1px solid #ECEDF3",
      }}
    >
      {children}
    </div>
  );
}
 
function CardLabel({ children }) {
  return (
    <div style={{ fontSize: 20, fontWeight: 700, color: "#161624" }}>{children}</div>
  );
}

function StratRow({ label, a, b }) {
  return (
    <tr style={{ borderTop: "1px solid #F2F2F7" }}>
      <td style={{ padding: "10px 0", color: "#8A8CA3" }}>{label}</td>
      <td style={{ padding: "10px 0", color: "#161624", fontWeight: 600 }}>{a}</td>
      <td style={{ padding: "10px 0", color: "#6B6D80" }}>{b}</td>
    </tr>
  );
}
 
function EngagementBar({ platform, score, color, note }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
        <span style={{ color: "#4A4C5E", fontWeight: 600 }}>{platform}</span>
        <span style={{ color, fontWeight: 700 }}>{score}</span>
      </div>
      <div style={{ height: 2, background: "#F0F0F5", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 12, color: "#9A9CAF", marginTop: 4 }}>{note}</div>
    </div>
  );
}
 

function Badge({ children, color, bg }) {
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

  function renderStepContent() {
   const activeCaption =
    recommendationData?.captions?.find((c) => c.platform === activeTab) ||
    recommendationData?.captions?.[0];

   const handleCopy = () => {
     if (!activeCaption) return;
     navigator.clipboard.writeText(
       `${activeCaption.caption}\n\n${activeCaption.hashtag}`
     ).catch(() => {});
     setCopied(true);
     setTimeout(() => setCopied(false), 1500);
   };



    switch (currentStepConfig.key) {
      case 'purpose':
        return (
          <div className="space-y-5">
            <div className="flex flex-col items-center justify-center">
              <h2 className="mt-2 font-bold tracking-[-0.04em] text-[#222222] sm:text-[42px]">
                What are you creating content for?
              </h2>
              <p className="mt-1.5 text-[16px] leading-5 text-[#667085]">
                Select the primary purpose of this content plan to help us tailor the generation process.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {purposeOptions.map((option) => {
                const isSelected = inputData.purpose === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateInputField('purpose', option)}
                    className={`flex items-center flex-col rounded-2xl border-2 px-5 py-6 text-left transition ${isSelected ? 'border-[#4f46e5] shadow-sm' : 'border-[#d9dbea] bg-white hover:border-[#c7c9f7] hover:bg-[#f8f8ff]'}`}
                  >
                    <div className={`flex justify-center items-center border rounded-full p-4 ${option === 'Content Creator' ? 'bg-blue-100' : option === 'Business' ? 'bg-green-100' : option === 'Existing Content' ? 'bg-violet-100' : 'bg-amber-100'}`}>
                      {option === 'Content Creator' ? <FaRegUser className="size-8 fill-blue-800" /> : option === 'Business' ? <MdAddBusiness className="size-8 fill-green-700" /> : option === 'Existing Content' ? <BsFileBarGraph className="size-8 fill-violet-800" /> : <BsStars className="size-8 fill-amber-700" />}
                    </div>

                    <div className="mt-5 text-lg font-bold text-center text-[#222222]">{option === "Business" ? "Business Owner" : option}</div>
                    <p className="mt-1 px-11 text-sm text-center leading-6 text-[#667085]">
                      {option === 'Content Creator' ? 'Building a personal brand, engaging an audience and growing followers across social platforms.' : option === 'Business' ? 'Promoting products or services, driving sales and building corporate brand awareness.' : option === 'Existing Content' ? 'Promote interactive conversations and stronger community connection.' : 'Analyze content you have already created to predict engagement and get optimization tips.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 'product':
        if (inputData.purpose === 'Existing Content') {
          const contentItems = inputData.existingContent || [];
          return (
            <div className="space-y-5">
              <div className="flex flex-col items-center justify-center text-center">
                <h2 className="mt-2 font-bold tracking-[-0.04em] text-[#222222] sm:text-[36px]">
                  Import Your Content
                </h2>
                <p className="mt-1.5 max-w-xl text-[16px] leading-5 text-[#667085]">
                  Provide the existing content you want to analyze. We support direct uploads or links from major social platforms.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {/* Paste URL */}
                <div className="rounded-2xl border-2 border-[#e8eaf2] bg-white p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEDFF]">
                      <Link2 className="size-5 text-[#4f46e5]" />
                    </div>
                    <h3 className="text-[16px] font-bold text-[#222222]">Paste URL</h3>
                  </div>

                  <div className="mt-5">
                    <p className="text-[13px] font-semibold text-[#667085]">Supported Platforms</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['TikTok', 'Instagram', 'YouTube'].map((platformName) => (
                        <span key={platformName} className="rounded-full bg-[#EEEDFF] px-3 py-1 text-[12px] font-semibold text-[#4f46e5]">
                          {platformName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-[#dddddd] bg-[#fafaff] px-3 py-3 focus-within:border-[#4f46e5] focus-within:ring-2 focus-within:ring-[#eeedff]">
                    <Globe className="size-4 shrink-0 text-[#9A9CAF]" />
                    <input
                      value={inputData.existingContentUrl}
                      onChange={(event) => updateInputField('existingContentUrl', event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleAddContentUrl();
                        }
                      }}
                      placeholder="https://tiktok.com/@user/video/..."
                      className="w-full bg-transparent text-sm text-[#333333] outline-none placeholder:text-[#B4B6C4]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddContentUrl}
                    disabled={!inputData.existingContentUrl.trim()}
                    className="mt-3 w-full rounded-lg bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add Link
                  </button>
                </div>

                {/* Upload File */}
                <div className="rounded-2xl border-2 border-[#e8eaf2] bg-white p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEDFF]">
                      <UploadCloud className="size-5 text-[#4f46e5]" />
                    </div>
                    <h3 className="text-[16px] font-bold text-[#222222]">Upload File</h3>
                  </div>

                  <label
                    htmlFor="existing-content-upload"
                    onDrop={handleContentFileDrop}
                    onDragOver={(event) => event.preventDefault()}
                    className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d9dbea] bg-[#fafaff] px-4 py-8 text-center transition hover:border-[#4f46e5] hover:bg-[#f8f8ff]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <UploadCloud className="size-5 text-[#8A8CA3]" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-[#222222]">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-[#9A9CAF]">MP4, MOV, JPG, or PNG (max. 500MB)</p>
                    <input
                      id="existing-content-upload"
                      type="file"
                      multiple
                      accept=".mp4,.mov,.jpg,.jpeg,.png"
                      onChange={handleContentFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Content to Analyze */}
              <div className="mt-6 rounded-2xl border-2 border-[#e8eaf2] bg-white">
                <div className="flex items-center justify-between border-b border-[#ECEDF3] px-6 py-4">
                  <h3 className="text-[16px] font-bold text-[#222222]">Content to Analyze</h3>
                  <span className="rounded-full bg-[#EEEDFF] px-3 py-1 text-[12px] font-semibold text-[#4f46e5]">
                    {contentItems.length} {contentItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {contentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                    <Archive className="size-8 text-[#C6C8D6]" />
                    <p className="mt-3 text-sm font-semibold text-[#667085]">No content added yet.</p>
                    <p className="mt-1 text-xs text-[#9A9CAF]">Paste a URL or upload a file above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#ECEDF3]">
                    {contentItems.map((item) => {
                      const PlatformIcon =
                        item.type === 'url'
                          ? item.platform === 'TikTok'
                            ? FaTiktok
                            : item.platform === 'Instagram'
                            ? FaInstagram
                            : item.platform === 'YouTube'
                            ? FaYoutube
                            : Link2
                          : FileVideo;

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFF]">
                              <PlatformIcon className="size-4 text-[#4f46e5]" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#333333]">{item.value}</p>
                              <p className="text-xs text-[#9A9CAF]">
                                {item.type === 'url' ? item.platform : formatFileSize(item.fileSize)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveContentItem(item.id)}
                            aria-label="Remove"
                            className="shrink-0 rounded-lg p-1.5 text-[#9A9CAF] transition hover:bg-[#F5F5FA] hover:text-[#E64545]"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-5">
            <div>
              <h2 className="mt-2 text-[16px] font-semibold tracking-[0.004em] text-[#444444] sm:text-[16px]">Product / Service</h2>
              <input
                value={inputData.product}
                onChange={(event) => updateInputField('product', event.target.value)}
                placeholder="e.g. Facial Cleanser"
                className="mt-2 w-full rounded-2xl border border-[#cccccc] bg-[#FcF9FF] px-4 py-4 text-sm text-[#333333] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#eeedff]"
              />
            </div>

            <div>
              <h2 className="mt-3 text-[16px] font-semibold tracking-[0.004em] text-[#444444] sm:text-[16px]">Category</h2>
              <select
                className="mt-2 w-full p-5 rounded-2xl border border-[#cccccc] bg-[#FcF9FF] px-4 py-4 text-sm text-[#172033] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#eeedff]"
                value={inputData.category}
                onChange={(event) => updateInputField('category', event.target.value)}
              >
                <option value="" disabled hidden>Select a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between pr-2">
                <h2 className="mt-2 text-[16px] font-semibold tracking-[0.004em] text-[#444444] sm:text-[16px]">Description</h2>
                <h2 className="mt-2 text-[16px] font-medium tracking-[0.004em] text-[#777777] sm:text-[16px]"></h2>
              </div>

              <textarea
                value={inputData.productDescription}
                onChange={(event) => updateInputField('productDescription', event.target.value)}
                rows={6}
                placeholder="Briefly describe your product, service, or topic."
                className="mt-2 w-full rounded-2xl border border-[#cccccc] bg-[#FcF9FF] px-4 py-4 text-sm text-[#172033] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#eeedff]"
              />
            </div>
          </div>
        );
      case 'audience':
        return (
          <div className="space-y-4 grid gap-4 md:grid-cols-5">
            <div className="col-span-3">
              <div className="mt-4 rounded-xl border-[#dddddd] border px-5 py-5 bg-white shadow-sm">
                <div className="flex flex-row items-center gap-1">
                  <LuNotepadText color="#3525CD" className="size-7" />
                  <h2 className="text-[22px] font-semibold tracking-[0.004em] text-[#333333] sm:text-[22px]">Demographics</h2>
                </div>

                <div className="mt-4 grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <h2 className="mt-2 text-[18px] font-[550] tracking-[0.004em] text-[#444444] sm:text-[18px]">Age Range</h2>
                    <div className="mt-1 grid gap-3 md:grid-cols-2">
                      {ageOptions.map((option) => {
                        const isSelected = inputData.age === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateInputField('age', option)}
                            className={`rounded-xl border-2 px-1 py-3 text-center transition ${isSelected ? 'border-[#4b42f1] bg-[#423ae0] shadow-sm' : 'border-[#cccccc] bg-white hover:border-[#c7c9f7] hover:bg-[#f8f8ff]'}`}
                          >
                            <div className={`text-[16px] font-medium ${isSelected ? 'text-[#ffffff]' : 'text-[#444444]'}`}>{option}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="mt-2 text-[18px] font-semibold tracking-[0.004em] text-[#333333] sm:text-[18px]">Gender</h2>
                    <div className="mt-8 grid gap-3 md:grid-cols-1">
                      {genderOptions.map((option) => {
                        const isSelected = inputData.gender === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateInputField('gender', option)}
                            className={`rounded-xl border-2 px-5 py-3 text-center transition ${isSelected ? 'border-[#4b42f1] bg-[#423ae0] shadow-sm' : 'border-[#cccccc] bg-white hover:border-[#c7c9f7] hover:bg-[#f8f8ff]'}`}
                          >
                            <div className={`text-[16px] font-medium ${isSelected ? 'text-[#ffffff]' : 'text-[#444444]'}`}>{option}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border px-5 py-5 bg-white border-[#dddddd]">
                <div className="flex justify-between items-center">
                  <div className="flex flex-row items-center gap-1">
                    <PiShapesBold color="#3525CD" className="size-7" />
                    <h2 className="text-[22px] font-semibold tracking-[0.004em] text-[#333333] sm:text-[22px]">Interests</h2>
                  </div>
                  <div className="rounded-full bg-[#4F46E51A] border-0 text-center px-2">
                    <p className="text-[16px] font-semibold text-[#3525CD]">Select min. 1</p>
                  </div>
                </div>

                <p className="mt-1.5 text-[16px] leading-5 text-[#667085]">Select all that apply.</p>
                <div className="mt-5 gap-3 flex flex-wrap">
                  {interest.map((option) => {
                    const isSelected = Array.isArray(inputData.interests) && inputData.interests.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateInputField('interests', option)}
                        className={`rounded-full border-2 px-5 py-3 text-center transition ${isSelected ? 'border-[#4b42f1] bg-[#423ae0] shadow-sm' : 'border-[#cccccc] bg-white hover:border-[#c7c9f7] hover:bg-[#f8f8ff]'}`}
                      >
                        <div className={`text-[16px] font-medium ${isSelected ? 'text-[#ffffff]' : 'text-[#444444]'}`}>{option}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-span-2 mt-8 rounded-xl border-2 px-5 py-5 bg-white self-stretch border-[#dddddd]">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                  <GrDocumentText color="#3525CD" className="size-6" />
                  <h2 className="mt-2 text-[22px] font-semibold tracking-[0.004em] text-[#333333] sm:text-[22px]">Audience Description</h2>
                </div>
                <div className="flex pt-2">
                  <p className="text-[16px] font-medium text-[#777777]"></p>
                </div>
              </div>

              <p className="mt-1.5 text-[16px] leading-5 text-[#667085]">
                Add any specific nuances about your audience's pain points, desires, or income levels.
              </p>
              <textarea
                value={inputData.audienceDescription}
                onChange={(event) => updateInputField('audienceDescription', event.target.value)}
                rows={6}
                placeholder="e.g. Professional women looking for high-quality, time-saving  skincare routines..."
                className="mt-2 h-4/5 w-full rounded-2xl border border-[#aaaaaa] bg-[#fcfaff] px-4 py-4 text-sm text-[#172033] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#eeedff]"
              />
            </div>
          </div>
        );
      case 'goal':
        return (
          <div className="space-y-5">
            <h2 className="text-l text-center font-bold tracking-tight text-[#172033]">Define your primary Goal</h2>
            <p className="mt-1.5 text-[16px] text-center leading-5 text-[#667085]">
              Select the primary purpose of this content plan to help us tailor the generation process.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {goalOptions.map((option) => {
                const isSelected = inputData.goal === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateInputField('goal', option)}
                    className={`rounded-2xl border px-5 flex py-3 text-left transition ${isSelected ? 'border-[#4b42f1] bg-[#ffffff] shadow-sm' : 'border-[#dddddd] bg-white hover:border-[#c7c9f7] hover:bg-[#f8f8ff]'}`}
                  >
                    <div>
                      <div className="mt-1 inline-block  rounded-2xl px-2 py-3 bg-blue-100">
                        {option === 'Maximize Reach' ? <AiOutlineStock color="#3525CD" className="size-6" /> : option === 'Drive Sales' ? <FiShoppingCart color="#3525CD" className="size-6" /> : option === 'Increase Followers' ? <MdOutlinePersonAddAlt1 color="#3525CD" className="size-6" /> : <IoMdMegaphone color="#3525CD" className="size-6" />}
                      </div>

                      <div className="text-lg font-bold text-[#444444]">{option}</div>
                      <p className="mt-2 mr-7 text-sm leading-6 text-[#444444]">
                        {option === 'Maximize Reach' ? 'Focus on impressions, virality, and getting your content in front of as many new eyes as possible.' : option === 'Drive Sales' ? 'Optimize for conversions, click-through rates to storefronts, and direct revenue generation.' : option === 'Increase Followers' ? 'Prioritize engagement metrics, profile visits, and building a loyal, long-term subscriber base.' : 'Focus on sentiment, share of voice, and establishing authority in your specific niche market.'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 'channels':
        return (
          <div className="space-y-5">
            <h2 className="text-l font-bold text-center tracking-tight text-[#172033]">Where is this going?</h2>
            <p className="mt-1.5 text-[16px] text-center leading-5 text-[#667085]">
              Select the primary platforms for this content. We'll tailor the intelligence gathered to fit the specific algorithms and audience behaviors of your chosen destinations.
            </p>
            <div className="pt-5 grid gap-6 md:grid-cols-3 px-16">
              
                  {channelOptions.map((option) => {
  const isSelected = selectedChannels.includes(option);

  return (
    <button
      key={option}
      type="button"
      onClick={() => toggleChannel(option)}
      aria-pressed={isSelected}
      className={`rounded-xl border-2 px-5 pb-8 pr-12 py-3 justify-start flex flex-col text-left transition ${
        isSelected
          ? 'border-[#4b42f1] bg-[#e8ebff] shadow-md'
          : 'border-[#dddddd] bg-white hover:border-[#c7c9f7] hover:bg-[#f8f8ff]'
      }`}
    >
    
    
                    <div className={`flex items-center justify-center text-center border w-fit h-fit rounded-2xl px-1.5 py-1.5 ${option === 'TikTok' ? 'bg-black my-1.5' : option === 'Instagram' ? 'my-1.5 bg-gradient-to-tr from-[#f58529] via-[#dd2c7c] to-[#8034b7]' : 'border-0'}`}>
                      {option === 'TikTok' ? <FaTiktok className="size-6 text-[#ffffff]" /> : option === 'Instagram' ? <FaInstagram className="size-6 text-[#ffffff]" /> : <FaFacebook color="#3525CD" className="size-9" />}
                    </div>

                    <div className="text-lg font-bold text-[#333333]">{option}</div>
                    <p className="mt-2 text-sm leading-6 text-[#444444]">
                      {option === 'TikTok' ? 'Optimize for high-velocity trends, hook retention, and sound-based discovery.' : option === 'Instagram' ? 'Plan branded campaigns and performance-focused channels.' : 'Refresh and repurpose existing assets into a stronger strategy.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="space-y-5">
            <div className="flex justify-center items-center flex-col">
              <div className="bg-[#E1E8FD] border-0 rounded-2xl p-3">
                <BsStars color="#3525CD" className="size-10" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-center tracking-tight text-[#172033] sm:text-[32px]">Meateka is creating your content plan...</h2>
              <p className="text-base text-center leading-5 text-[#667085] sm:text-[18px]">
                Our intelligence engine is analyzing data to build your optimal schedule.
              </p>
            </div>

            <div className="mt-6 mx-4 sm:mx-8 md:mx-16 lg:mx-56 rounded-2xl border border-[#d9dbea] bg-[rgb(244,244,255)] p-6 flex flex-col items-start gap-4">
              {predictionProcess.map((process, index) => (
                <div key={index} className="flex gap-4 items-center justify-center">
                  {index === currentProcess ? (
                    <div className="bg-[#4F46E5] rounded-full relative w-6 h-6 overflow-hidden shrink-0">
                      <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) scale(0.20)' }}>
                        <OrbitProgress variant="split-disc" dense color="#ffffff" text="" textColor="#623030" />
                      </div>
                    </div>
                  ) : index < currentProcess ? (
                    <CircleCheck color="#12a77d" className="size-6" />
                  ) : (
                    <div className="border-2 rounded-full p-1 border-[#bbbbbb]">
                      <FaHourglass color="#bbbbbb" className="size-3" />
                    </div>
                  )}

                   <p className="text-base text-center font-medium leading-5 text-[#333333] sm:text-[21px]">{process}</p>
                </div>
              ))}
            </div>

             {createError && (
               <div className="flex flex-col items-center gap-3">
                 <p className="text-[15px] font-semibold text-[#C2185B]">{String(createError)}</p>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-lg bg-[#4f46e5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4338ca]"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        );
      case 'review': {
        if (!recommendationData) {
          return (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <OrbitProgress color="#4f46e5" size="small" />
              <p className="text-[15px] font-semibold text-[#667085]">
                We couldn't load your recommendation yet.
              </p>
              <p className="max-w-sm text-[13px] text-[#9A9CAF]">
                Hang tight while we finish generating it, or go back and try again if this doesn't update in a moment.
              </p>
            </div>
          );
        }

        const primaryIdea = recommendationData.ideas?.[0];
        const alternates = primaryIdea?.alternates || [];
        const platformPredictions = recommendationData.platform_predictions || [];

        return (
          <div className="space-y-5">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              <StatCard icon={<Lightbulb size={16} color="#6C5CE7" />} label="Recommended Content" value={recommendationData.title || '—'} />
              <StatCard icon={<Share2 size={16} color="#00B37E" />} label="Best Platform" value={recommendationData.platform || '—'} />
              <StatCard icon={<TrendingUp size={16} color="#6C5CE7" />} label="Expected Engagement" value={recommendationData.performance || '—'} />
              <StatCard icon={<Clock size={16} color="#8A8CA3" />} label="Best Posting Time" value={recommendationData.time || '—'} />
            </div>


            <div>
              <div style={{ display: "grid", gridTemplateColumns: "4fr 1fr", gap: 16, marginBottom: 16 }}>
          <Card>
            <div className="border-b border-[#aaaaaa] pb-3">
              <CardLabel >Content Idea Recommendation</CardLabel>
            </div>
            
            <h2 className="pt-3" style={{ fontSize: 18, fontWeight: 600, color: "#161624", margin: "6px 0 10px"}}>
              {primaryIdea?.idea_name || 'No idea generated yet'}
            </h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {primaryIdea?.content_type && (
                <Badge color="#6C5CE7" bg="#F0EDFE">{primaryIdea.content_type}</Badge>
              )}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#8A8CA3", fontWeight: 600, marginBottom: 8 }}>
                Alternative Ideas:
              </div>
              {alternates.length > 0 ? (
                alternates.map((alt) => (
                  <div key={alt.alternate_id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4A4C5E", marginBottom: 6 }}>
                    <span style={{ color: "#6C5CE7" }}>▸</span> {alt.idea_name}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: "#9A9CAF" }}>No alternative ideas available.</div>
              )}
            </div>
          </Card>
 
          <Card>
            <CardLabel>Engagement Prediction</CardLabel>
            <div style={{ marginTop: 14 }}>
              {platformPredictions.length > 0 ? (
                 platformPredictions.map((prediction) => {
                  const label = String(prediction.prediction || '').toLowerCase();
                  const numScore = label === "high" ? 85 : label === "low" ? 45 : 70;
                  const color = label === "high" ? "#12A77D" : label === "low" ? "#C2185B" : "#8A8CA3";
                  const note = label === "high" ? "High Potential" : label === "low" ? "Low Potential" : "Medium Potential";
                  return (
                    <div key={prediction.platform_id}>
                      <div style={{ height: 18 }} />
                      <EngagementBar platform={prediction.platform} score={numScore} color={color} />
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 13, color: "#9A9CAF" }}>No engagement predictions available.</div>
              )}
            </div>
            <p style={{ fontSize: 12.5, color: "#9A9CAF", marginTop: 18, lineHeight: 1.5 }}>
              <span>{recommendationData.platform || '—'}</span><span>'s algorithm favors this hook format for your niche right now, suggesting higher reach.</span>
            </p>
          </Card>
        </div>
            </div>



              <div>
                <Card>
            <CardLabel>Caption &amp; Hashtags</CardLabel>
            <div style={{ display: "flex", gap: 18, borderBottom: "1px solid #ECEDF3", marginTop: 12, marginBottom: 14 }}>
              {(recommendationData.captions || []).map((tab) => (
                <button
                  key={tab.caption_id}
                  onClick={() => setActiveTab(tab.platform)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0 0 10px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: activeTab === tab.platform ? "#5B4FE5" : "#9A9CAF",
                    borderBottom: activeTab === tab.platform ? "2px solid #5B4FE5" : "2px solid transparent",
                    textTransform: "capitalize",
                  }}
                >
                  {tab.platform}
                </button>
              ))}
            </div>
            <div style={{ background: "#F6F5FE", borderRadius: 10, padding: 14, fontSize: 13.5, color: "#4A4C5E", lineHeight: 1.6, minHeight: 90, whiteSpace: "pre-wrap" }}>
              {activeCaption && (
                <>
                  {activeCaption.caption || '---'}
                  <br />
                  <br />
                  <span style={{ color: "#5B4FE5" }}>
                    {activeCaption.hashtag}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={handleCopy}
              style={{
                marginTop: 14,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 0",
                borderRadius: 8,
                border: "1px solid #E2E3EC",
                background: "#fff",
                color: "#4A4C5E",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy Caption"}
            </button>
          </Card>
              </div>

          </div>
        );
      }
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaff] text-[#172033]">
      <div className="flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="relative min-w-0 flex-1 transition-all duration-300 ease-in-out">
          {/* {!isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
              className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#d9dbea] bg-white text-xl font-bold text-[#4f46e5] shadow-sm transition-all duration-300 ease-in-out hover:bg-[#f2f3ff]"
            >
              ☰
            </button>
          )} */}

          {isSidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-[#172033]/10 lg:hidden"
            />
          )}

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-[#d9dbea] bg-white shadow-[0_18px_40px_rgba(79,70,229,0.06)]">
              <div className="flex flex-col items-center border-[#e8eaf2] px-5 py-5 sm:px-7">
                <div>
                  <p className="text-[18px] font-bold tracking-[0.0018em] text-[#4f46e5]"></p>
                </div>

                <div className="mt-5 overflow-x-auto pb-1">
                  <div className="flex min-w-max items-center gap-6">
                    {steps.map((step, index) => {
                      const isActive = index === currentStep;
                      const isComplete = index < currentStep;
                      const isUpcoming = index > currentStep;

                      return (
                        <React.Fragment key={step.key}>
                          <button
                            type="button"
                            onClick={() => !isUpcoming && setCurrentStep(index)}
                            disabled={isUpcoming}
                            className={`flex items-center gap-2 rounded-full border-0 px-2.5 py-1.5 transition ${isActive ? 'bg-[#f2f3ff]' : isComplete ? 'bg-[#edfaf3]' : 'bg-white'} ${isUpcoming ? 'cursor-default opacity-75' : 'cursor-pointer'}`}
                          >
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? 'bg-[#4f46e5] text-white' : isComplete ? 'bg-[#12a77d] text-white' : 'bg-[#eef0f8] text-[#667085]'}`}>
                              {isComplete ? '✓' : index + 1}
                            </span>
                            <span className={`whitespace-nowrap text-[11px] font-semibold ${isActive ? 'text-[#3d42d9]' : isComplete ? 'text-[#0d8d68]' : 'text-[#667085]'}`}>
                              {step.title}
                            </span>
                          </button>

                          {index < steps.length - 1 && (
                            <div className={`h-px w-4 ${index < currentStep ? 'bg-[#12a77d]' : 'bg-[#aaaaaa]'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              <section className="mt-[-2rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                <div className="rounded-2xl bg-[#ffffff] px-6 sm:px-8">{renderStepContent()}</div>

                <div className="mt-8 flex justify-end flex-col-reverse gap-[60rem] sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                    className={`${isFirstStep || currentStep > 4 ? 'hidden' : ''} inline-flex items-center justify-center rounded-lg border border-[#d9dbea] px-4 py-3 text-sm font-semibold text-[#172033] transition hover:bg-[#f8f8ff] disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading || !isStepValid() || ((currentStep === 5) && (currentProcess < predictionProcess.length))}
                    className="items-center justify-center rounded-lg bg-[#4f46e5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {currentStep === 4 ? 'Create' : 'Continue'}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}