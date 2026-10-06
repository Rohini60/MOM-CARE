import React, { useState } from 'react';
import { Sparkles, Heart, RefreshCw, Info, Maximize2, X, Camera, Eye } from 'lucide-react';
import { getPregnancyWeekData } from '../config/pregnancyWeeks';

interface WombVisualHeaderProps {
  week: number;
  days: number;
  babyNickname?: string;
  onOpenAiChat?: (prompt?: string) => void;
}

type WombViewMode = 'render' | 'profile' | 'ultrasound';

export const WombVisualHeader: React.FC<WombVisualHeaderProps> = ({
  week,
  days,
  babyNickname = 'Baby',
  onOpenAiChat,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnatomyDetails, setShowAnatomyDetails] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<WombViewMode>('render');

  const [customAiVision, setCustomAiVision] = useState<{
    promptSummary: string;
    fetalPose: string;
    amnioticDetails: string;
    heartRateBpm: number;
  } | null>(null);

  const weekData = getPregnancyWeekData(week);

  const viewImages: Record<WombViewMode, { src: string; title: string; desc: string }> = {
    render: {
      src: '/src/assets/images/baby_in_womb_1790941790228.jpg',
      title: '3D Photorealistic Womb View',
      desc: 'Developing fetus peacefully resting in the amniotic sac with warm rose lighting & umbilical flow',
    },
    profile: {
      src: '/src/assets/images/fetal_womb_render_1790941803084.jpg',
      title: 'Fetal Profile & Features',
      desc: 'Detailed close-up of facial contours, tiny tucked hands, and delicate embryonic skin',
    },
    ultrasound: {
      src: '/src/assets/images/womb_baby_close_1790941814716.jpg',
      title: 'HD-Live 3D Ultrasound View',
      desc: 'Golden-rose high-definition surface rendering of fetal anatomy and facial harmony',
    },
  };

  const currentImage = viewImages[activeViewMode];

  const handleGenerateAiWombView = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/womb-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregnancyWeek: week,
          pregnancyDays: days,
          babyNickname,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setCustomAiVision(json.data);
      }
    } catch (err) {
      console.warn('Womb render fallback:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#FFFFFF] via-[#FFF9FA] to-[#FCF8F6] border border-[#E9DFDC] shadow-sm relative overflow-hidden transition-all">
      {/* Background soft pink amniotic lighting aura */}
      <div
        className="absolute -right-12 -top-12 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, #FADADD 0%, #F4C2C2 40%, transparent 70%)' }}
      />
      <div
        className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, #E8C5C8 0%, #FCF8F6 50%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Top Badges and View Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2E1E3] text-[#9F5F6E] border border-[#E9DFDC] shadow-2xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C98291]" />
              <span>Week {week} + {days}d in the Womb</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Switcher */}
            <div className="flex bg-[#FCF8F6] p-0.5 rounded-xl border border-[#E9DFDC]">
              <button
                onClick={() => setActiveViewMode('render')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeViewMode === 'render'
                    ? 'bg-[#9F5F6E] text-white shadow-2xs'
                    : 'text-[#766D72] hover:text-[#352F35]'
                }`}
                title="3D Womb Render"
              >
                3D Womb
              </button>
              <button
                onClick={() => setActiveViewMode('profile')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeViewMode === 'profile'
                    ? 'bg-[#9F5F6E] text-white shadow-2xs'
                    : 'text-[#766D72] hover:text-[#352F35]'
                }`}
                title="Fetal Profile"
              >
                Profile
              </button>
              <button
                onClick={() => setActiveViewMode('ultrasound')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeViewMode === 'ultrasound'
                    ? 'bg-[#9F5F6E] text-white shadow-2xs'
                    : 'text-[#766D72] hover:text-[#352F35]'
                }`}
                title="HD-Live 3D Ultrasound"
              >
                HD-Live
              </button>
            </div>

            <button
              onClick={handleGenerateAiWombView}
              disabled={isGenerating}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#E9DFDC] text-[#9F5F6E] text-[11px] font-medium hover:bg-[#F2E1E3] transition-all shadow-2xs disabled:opacity-50"
              title="Refresh AI Womb Insights"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">AI Insights</span>
            </button>
          </div>
        </div>

        {/* 3D Photorealistic Womb Photo Canvas */}
        <div className="w-full h-64 sm:h-72 rounded-2xl relative overflow-hidden shadow-inner border border-[#E9DFDC] group">
          {/* Main Photorealistic Womb Image */}
          <img
            src={currentImage.src}
            alt={`Baby in mother's womb at week ${week}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Vignette & Amniotic Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#201518]/90 via-[#201518]/25 to-[#201518]/60 pointer-events-none" />

          {/* Top Left: Amniotic Environment Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-[#2B1F24]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E8B6A3]/30 text-white shadow-sm">
              <span className="text-[10px] text-[#E8B6A3] block uppercase font-bold tracking-wider">
                {currentImage.title}
              </span>
              <span className="text-[#FCF8F6] text-xs font-medium">
                {babyNickname} at {week} Weeks
              </span>
            </div>
          </div>

          {/* Top Right: Fetal Heart Rate & Zoom Button */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <div className="bg-[#2B1F24]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#C98291]/40 text-white flex items-center gap-1.5 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-[#C98291] fill-current animate-pulse" />
              <span className="text-xs font-bold text-[#FCF8F6]">
                {customAiVision?.heartRateBpm || (week < 12 ? '155 bpm' : '142 bpm')}
              </span>
            </div>

            <button
              onClick={() => setIsZoomOpen(true)}
              className="p-2 rounded-xl bg-[#2B1F24]/85 hover:bg-[#352F35] backdrop-blur-md border border-white/20 text-white transition-all shadow-sm"
              title="View full-resolution photo"
              aria-label="Zoom in on baby in womb photo"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Overlay: Fetal Pose & Size Comparison */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-end justify-between gap-2 text-white">
            <div className="bg-[#2B1F24]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 max-w-[70%]">
              <div className="flex items-center gap-1.5 text-[10px] text-[#E8B6A3] font-semibold uppercase tracking-wide">
                <span>Fetal Posture & Anatomy</span>
              </div>
              <p className="text-xs font-medium text-[#FCF8F6] line-clamp-1">
                {customAiVision?.fetalPose ||
                  (week >= 32
                    ? 'Cephalic presentation (head-down) with active hiccups & rhythmic chest practice'
                    : 'Curled in gentle flexion, cushioned in clear, protective amniotic fluid')}
              </p>
            </div>

            <button
              onClick={() => setShowAnatomyDetails(!showAnatomyDetails)}
              className="px-3 py-2 rounded-xl bg-[#C98291]/90 hover:bg-[#9F5F6E] backdrop-blur-md border border-white/20 text-xs text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm ml-auto"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showAnatomyDetails ? 'Hide Details' : 'Anatomy Details'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Anatomy Details */}
        {showAnatomyDetails && (
          <div className="mt-3 p-4 rounded-2xl bg-white border border-[#E9DFDC] text-xs text-[#352F35] space-y-2 animate-in fade-in shadow-2xs">
            <div className="flex items-center justify-between font-bold text-[#9F5F6E]">
              <span>Week {week} Medical Developmental Milestones</span>
              <span className="text-[#766D72] text-[11px]">
                {weekData.approxLength} • {weekData.approxWeight}
              </span>
            </div>
            <p className="text-[#766D72] leading-relaxed">
              {customAiVision?.amnioticDetails ||
                `At ${week} weeks gestation, the fetus is actively developing sensory neural pathways, lung surfactant alveoli, and gentle sucking reflexes. The surrounding amniotic fluid maintains an optimal 37.5°C thermal cocoon and provides essential acoustic shielding.`}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E9DFDC] text-[11px]">
              <div className="p-2 rounded-xl bg-[#FCF8F6]">
                <span className="text-[#766D72] block">Placenta & Cord:</span>
                <span className="font-semibold text-[#352F35]">Fundal Posterior • 3-Vessel Cord</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FCF8F6]">
                <span className="text-[#766D72] block">Amniotic Fluid Index (AFI):</span>
                <span className="font-semibold text-[#352F35]">Normal Reassuring Fluid Cushion</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen High-Resolution Image Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-[#201518] rounded-3xl overflow-hidden border border-[#E9DFDC]/20 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#9F5F6E] text-white">
                  Week {week} Womb Photo
                </span>
                <span className="text-sm font-semibold text-[#E8B6A3]">
                  {currentImage.title}
                </span>
              </div>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative max-h-[70vh] flex items-center justify-center bg-black/40 p-2">
              <img
                src={currentImage.src}
                alt={`Detailed view of baby in womb at week ${week}`}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-lg"
              />
            </div>

            {/* Modal Footer Description */}
            <div className="p-4 bg-[#2B1F24] border-t border-white/10 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
              <p className="text-[#FCF8F6]/80 text-xs max-w-lg">
                {currentImage.desc}
              </p>
              <div className="flex gap-2">
                {(['render', 'profile', 'ultrasound'] as WombViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setActiveViewMode(mode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                      activeViewMode === mode
                        ? 'bg-[#C98291] text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
