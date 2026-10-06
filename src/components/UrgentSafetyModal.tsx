import React from 'react';
import { AlertCircle, Phone, X, ShieldAlert, HeartHandshake, ArrowRight } from 'lucide-react';
import { useTranslation } from '../translations';

interface UrgentSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptomName?: string;
  emergencyReason?: string;
  doctorName?: string;
  doctorPhone?: string;
  clinicName?: string;
  emergencyContact?: string;
  familyContactPhone?: string;
}

export const UrgentSafetyModal: React.FC<UrgentSafetyModalProps> = ({
  isOpen,
  onClose,
  symptomName,
  emergencyReason,
  doctorName,
  doctorPhone,
  clinicName,
  emergencyContact,
  familyContactPhone,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#C62828] shadow-2xl space-y-4 relative overflow-hidden">
        {/* Urgent Red Header Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#C62828]" />

        <div className="flex items-start justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] border border-[#C62828]/40 text-[#C62828] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFF0F2] text-[#C62828]">
                🔴 {t.redEmergencyTitle}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7D6E74] hover:bg-[#FFF0F2] hover:text-[#C62828] transition-colors"
            aria-label="Close warning"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hardcoded Red Emergency Message in Selected Language (Requirement 7) */}
        <div className="p-4 rounded-2xl bg-[#FFF0F2] border border-[#C62828]/40 space-y-2 text-xs">
          <p className="font-extrabold text-[#C62828] text-sm leading-snug">
            {t.redEmergencyMessage}
          </p>
          {symptomName && (
            <p className="text-[#352F35] font-semibold pt-1 border-t border-[#FADADD]">
              Reported: <span className="text-[#C62828]">{symptomName}</span>
            </p>
          )}
        </div>

        {/* Emergency Contacts card */}
        <div className="p-3.5 rounded-2xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs space-y-2">
          {doctorName && (
            <div className="flex items-center justify-between text-[#766D72]">
              <span>Doctor / Hospital:</span>
              <span className="font-bold text-[#352F35]">{doctorName}</span>
            </div>
          )}
          {clinicName && (
            <div className="flex items-center justify-between text-[#766D72]">
              <span>Clinic:</span>
              <span className="font-semibold text-[#352F35]">{clinicName}</span>
            </div>
          )}
          {emergencyContact && (
            <div className="flex items-center justify-between text-[#766D72]">
              <span>Contact:</span>
              <span className="font-semibold text-[#352F35]">{emergencyContact}</span>
            </div>
          )}
        </div>

        {/* Action Direct Call Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {/* 108 Emergency Ambulance Button */}
          <a
            href="tel:108"
            className="w-full py-3.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>{t.callAmbulanceBtn}</span>
          </a>

          {/* Doctor Call Button if phone is present */}
          {doctorPhone && (
            <a
              href={`tel:${doctorPhone}`}
              className="w-full py-3 rounded-xl bg-white border-2 border-[#C62828] text-[#C62828] hover:bg-[#FFF0F2] font-bold text-xs sm:text-sm text-center transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t.callDoctorBtn} ({doctorPhone})</span>
            </a>
          )}

          {/* Family Call Button if phone is present */}
          {familyContactPhone && (
            <a
              href={`tel:${familyContactPhone}`}
              className="w-full py-2.5 rounded-xl bg-white border border-[#E9DFDC] text-[#352F35] hover:bg-[#F2E1E3] font-semibold text-xs text-center transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#9F5F6E]" />
              <span>{t.callFamilyBtn} ({familyContactPhone})</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-[#766D72] hover:text-[#352F35] text-xs font-medium transition-colors mt-1"
          >
            {t.cancelBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
