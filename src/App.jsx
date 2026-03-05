import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  Layout, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  X,
  Upload,
  AlertCircle,
  AlertTriangle,
  Camera,
  Printer,
  ChevronLeft
} from 'lucide-react';

const apiKey = ""; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

// 严格日期校验正则：YYYY.MM.DD - YYYY.MM.DD 或 YYYY.MM.DD - 至今
const DATE_REGEX = /^\d{4}\.\d{2}\.\d{2}\s*-\s*(\d{4}\.\d{2}\.\d{2}|至今)$/;

const EMPTY_DATA = {
  themeColor: "#1e3a8a", 
  showPhoto: true,
  profile: { name: "", title: "", phone: "", email: "", location: "", website: "", summary: "", photo: null },
  education: [{ id: 'init-edu', school: "", degree: "", period: "", description: "", gpa: "" }],
  research: [{ id: 'init-res', title: "", role: "", period: "", description: "" }],
  experience: [{ id: 'init-exp', company: "", position: "", period: "", description: "" }],
  skills: [],
  hobbies: []
};

const STEPS = [
  { id: 'profile', label: '个人资料', icon: User },
  { id: 'education', label: '教育背景', icon: GraduationCap },
  { id: 'research', label: '研究经历', icon: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
  ) },
  { id: 'experience', label: '职业经历', icon: Briefcase },
  { id: 'skills', label: '技能与兴趣', icon: Settings },
  { id: 'preview', label: '生成预览', icon: FileText },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState(EMPTY_DATA);
  const [errors, setErrors] = useState({});

  // 检查必填项：姓名、电话、邮箱
  const isProfileComplete = () => {
    const { name, phone, email } = resumeData.profile;
    return name?.trim() !== "" && phone?.trim() !== "" && email?.trim() !== "";
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setResumeData(p => ({ ...p, profile: { ...p.profile, photo: canvas.toDataURL('image/jpeg', 0.8) } }));
      };
    };
  };

  const handleListChange = (type, id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));

    if (field === 'period') {
      const errorKey = `${type}-${id}-period`;
      if (value && !DATE_REGEX.test(value)) {
        setErrors(prev => ({ ...prev, [errorKey]: "格式错误: YYYY.MM.DD - 至今" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    }
  };

  const canGoNext = () => {
    const currentStepId = STEPS[currentStep].id;
    if (currentStepId === 'profile') return isProfileComplete();
    return !Object.keys(errors).some(key => key.startsWith(currentStepId));
  };

  const isLastStep = currentStep === STEPS.length - 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* 顶部工具栏 (打印时隐藏) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-lg text-white shadow-md shadow-indigo-100"><Layout size={20} /></div>
          <h1 className="text-lg font-black tracking-tight uppercase">Academic CV Engine</h1>
        </div>
        {isLastStep && isProfileComplete() && (
          <div className="flex gap-4">
            <button onClick={() => setCurrentStep(0)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-all uppercase px-4">
              <ChevronLeft size={14} /> 返回修改
            </button>
            <button 
              onClick={handlePrint} 
              className="bg-indigo-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-2 animate-pulse hover:animate-none"
            >
              <Printer size={16} /> 打印 / 导出 PDF
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-4 md:p-10 overflow-y-auto no-scrollbar print:p-0 print:overflow-visible">
        <div className={`w-full transition-all duration-500 ${isLastStep ? 'max-w-[210mm]' : 'max-w-4xl'} print:max-w-none`}>
          {!isLastStep ? (
            /* 编辑表单流程 */
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-14 h-14 bg-indigo-900 text-white rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                    {React.createElement(STEPS[currentStep].icon, { size: 28 })}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black tracking-tighter">{STEPS[currentStep].label}</h2>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                       <div className="h-full bg-indigo-600 transition-all duration-700" style={{width: `${(currentStep + 1) * (100/STEPS.length)}%`}}></div>
                    </div>
                  </div>
                </div>

                {currentStep === 0 && (
                  <div className="space-y-10 animate-in slide-in-from-bottom-4">
                    <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-white border-4 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105 shadow-xl">
                          {resumeData.profile.photo ? <img src={resumeData.profile.photo} className="w-full h-full object-cover" /> : <Camera size={36} className="text-slate-200"/>}
                        </div>
                        {resumeData.profile.photo && <button onClick={() => setResumeData(p=>({...p, profile: {...p.profile, photo: null}}))} className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 transition-all"><X size={14}/></button>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-indigo-900 mb-1">圆形头像预览</h3>
                        <p className="text-[10px] text-slate-400 mb-4 font-bold tracking-widest uppercase italic">自动适应 Academic CV 侧栏布局</p>
                        <label className="bg-indigo-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase cursor-pointer hover:bg-black transition-all shadow-lg active:scale-95 inline-block">
                          上传照片 <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input label="全名" required value={resumeData.profile.name} onChange={v => setResumeData(p=>({...p, profile: {...p.profile, name: v}}))} />
                      <Input label="地址 (Address)" value={resumeData.profile.location} onChange={v => setResumeData(p=>({...p, profile: {...p.profile, location: v}}))} />
                      <Input label="电话 (Phone)" required value={resumeData.profile.phone} onChange={v => setResumeData(p=>({...p, profile: {...p.profile, phone: v}}))} />
                      <Input label="邮箱 (Email)" required value={resumeData.profile.email} onChange={v => setResumeData(p=>({...p, profile: {...p.profile, email: v}}))} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Personal Summary (个人简介)</label>
                       <textarea rows="5" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-indigo-50 outline-none leading-relaxed shadow-inner" value={resumeData.profile.summary} onChange={e => setResumeData(p=>({...p, profile: {...p.profile, summary: e.target.value}}))} placeholder="请概括您的学术背景或职业目标..." />
                    </div>
                  </div>
                )}

                {(['education', 'research', 'experience'].includes(STEPS[currentStep].id)) && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4">
                    {resumeData[STEPS[currentStep].id].map((item) => (
                      <div key={item.id} className="p-8 bg-slate-50/50 rounded-[2.5rem] relative border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                        <button onClick={() => setResumeData(p=>({...p, [STEPS[currentStep].id]: p[STEPS[currentStep].id].filter(i=>i.id!==item.id)}))} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                          <Input label="主标题 (院校/公司/项目)" value={item.school || item.title || item.company} onChange={v => handleListChange(STEPS[currentStep].id, item.id, item.school !== undefined ? 'school' : (item.title !== undefined ? 'title' : 'company'), v)} />
                          <Input label="身份 (学位/职位/角色)" value={item.degree || item.role || item.position} onChange={v => handleListChange(STEPS[currentStep].id, item.id, item.degree !== undefined ? 'degree' : (item.role !== undefined ? 'role' : 'position'), v)} />
                          <Input 
                            label="日期范围" 
                            hint="YYYY.MM.DD - YYYY.MM.DD" 
                            placeholder="如：2023.02.01 - 至今"
                            value={item.period} 
                            error={errors[`${STEPS[currentStep].id}-${item.id}-period`]}
                            onChange={v => handleListChange(STEPS[currentStep].id, item.id, 'period', v)} 
                          />
                          {STEPS[currentStep].id === 'education' && <Input label="GPA 成绩" value={item.gpa} onChange={v => handleListChange('education', item.id, 'gpa', v)} />}
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">详细描述 (将自动转化为 Bullet Points)</label>
                           <textarea className="w-full p-6 bg-white border border-slate-100 rounded-[1.5rem] text-xs shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none" rows="4" placeholder="每行一条核心内容..." value={item.description} onChange={e => handleListChange(STEPS[currentStep].id, item.id, 'description', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setResumeData(p=>({...p, [STEPS[currentStep].id]: [...p[STEPS[currentStep].id], {id: Date.now(), title:"", company:"", school:"", degree:"", period:"", description:""}]}))} className="w-full py-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 font-black uppercase text-xs tracking-widest hover:border-indigo-200 hover:text-indigo-400 transition-all">+ 增加新项目</button>
                  </div>
                )}

                {STEPS[currentStep].id === 'skills' && (
                  <div className="space-y-12 animate-in slide-in-from-bottom-4">
                    <SkillSection title="专业技能 (SKILLS)" list={resumeData.skills} set={l => setResumeData(p=>({...p, skills: l}))} />
                    <SkillSection title="兴趣爱好 (INTERESTS)" list={resumeData.hobbies} set={l => setResumeData(p=>({...p, hobbies: l}))} />
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between gap-6">
                <button onClick={() => setCurrentStep(c => c - 1)} disabled={currentStep === 0} className="px-10 py-4 rounded-2xl font-black text-xs uppercase border-2 text-slate-500 hover:bg-white active:scale-95 transition-all">上一步</button>
                <button 
                  onClick={() => canGoNext() && setCurrentStep(c => c + 1)} 
                  className={`flex-1 px-10 py-4 text-white rounded-2xl font-black text-xs uppercase shadow-2xl transition-all active:scale-95 ${canGoNext() ? 'bg-indigo-900 hover:bg-black shadow-slate-200' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}
                >
                  {currentStep === 0 && !isProfileComplete() ? '请完成核心个人资料' : (canGoNext() ? '下一步' : '日期格式错误')}
                </button>
              </div>
            </div>
          ) : (
            /* 最终双栏 Academic CV 预览 */
            <div className="flex flex-col items-center pb-24 animate-in fade-in duration-1000 print:pb-0">
               {isProfileComplete() ? (
                  <>
                    <div className="print:hidden w-full max-w-2xl bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-8 flex gap-4 items-center text-indigo-900 shadow-sm">
                       <AlertCircle size={24} className="flex-shrink-0" />
                       <div className="text-[11px] font-medium leading-relaxed">
                         <span className="font-black uppercase tracking-widest block mb-0.5">PDF 导出提示</span>
                         点击右上角按钮后，请在打印选项中勾选<strong>“背景图形 (Background Graphics)”</strong>以显示侧栏颜色，并将页边距设为<strong>“无 (None)”</strong>。
                       </div>
                    </div>
                    <AcademicCVView data={resumeData} />
                  </>
               ) : (
                  <div className="bg-white p-20 rounded-[3rem] shadow-2xl text-center border-4 border-dashed border-red-100 max-w-lg animate-bounce">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">无法导出 PDF</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed">个人资料缺失。请返回第一步填写姓名、电话和邮箱。</p>
                    <button onClick={() => setCurrentStep(0)} className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-red-600 transition-all">返回第一步</button>
                  </div>
               )}
            </div>
          )}
        </div>
      </main>

      {/* 核心打印引擎 CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { 
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          main { 
            display: block !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            overflow: visible !important;
          }
          @page { 
            size: A4 portrait; 
            margin: 0 !important; 
          }
          /* 确保阴影和圆角在导出时不影响排版 */
          .shadow-2xl { shadow: none !important; box-shadow: none !important; }
          * { -webkit-print-color-adjust: exact !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}

// --- 最终 Academic CV 双栏组件 ---
function AcademicCVView({ data }) {
  const filterValid = (arr) => arr.filter(i => Object.entries(i).filter(([k])=>k!=='id').some(([_,v])=>v&&v.toString().trim().length>0));
  const edu = filterValid(data.education);
  const exp = filterValid(data.experience);
  const res = filterValid(data.research);
  const skills = data.skills.filter(s => s.trim());
  const hobbies = data.hobbies.filter(h => h.trim());

  const formatBulletPoints = (text) => {
    if (!text) return null;
    return text.split('\n').filter(l => l.trim()).map((line, idx) => (
      <div key={idx} className="flex gap-2 text-[12px] leading-relaxed text-slate-700 mb-1.5 text-justify">
        <span className="text-slate-900 mt-1 shrink-0">•</span>
        <span>{line.trim()}</span>
      </div>
    ));
  };

  return (
    <div id="resume-container" className="bg-white w-[210mm] min-h-[297mm] shadow-2xl flex font-sans text-slate-800 print:shadow-none print:w-[210mm] print:h-[297mm] overflow-hidden">
      {/* 左侧栏 (30%) */}
      <aside className="w-[30%] bg-slate-50 p-10 border-r border-slate-100 flex flex-col h-full shrink-0 print:bg-slate-50">
        {data.showPhoto && data.profile.photo && (
          <div className="w-full aspect-square rounded-full border-4 border-white shadow-xl overflow-hidden mb-12 ring-8 ring-indigo-50/20">
            <img src={data.profile.photo} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-12">
          {/* PERSONAL */}
          <section>
            <h2 className="text-[11px] font-black text-slate-900 tracking-[0.3em] uppercase border-b-2 border-slate-200 pb-1 mb-6">Personal</h2>
            <div className="space-y-5 text-[11px] font-bold text-slate-600">
              <div><span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[9px]">Name</span><span className="text-slate-900">{data.profile.name || "姓名"}</span></div>
              <div><span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[9px]">Address</span><span className="text-slate-900 whitespace-pre-wrap">{data.profile.location || "-"}</span></div>
              <div><span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[9px]">Phone number</span><span className="text-slate-900">{data.profile.phone || "-"}</span></div>
              <div><span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[9px]">Email</span><span className="text-slate-900 break-all">{data.profile.email || "-"}</span></div>
            </div>
          </section>

          {/* INTERESTS */}
          {hobbies.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black text-slate-900 tracking-[0.3em] uppercase border-b-2 border-slate-200 pb-1 mb-6">Interests</h2>
              <div className="space-y-3 text-[12px] font-bold text-slate-700 leading-tight">
                {hobbies.map(h => (
                  <div key={h} className="flex gap-2 items-center"><span className="text-slate-900 shrink-0 text-[10px]">■</span>{h}</div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>

      {/* 主内容区 (70%) */}
      <main className="w-[70%] p-14 flex flex-col h-full bg-white overflow-hidden">
        {/* 顶部标题 */}
        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6 leading-none break-words">{data.profile.name || "NAME"}</h1>
          <p className="text-[13px] leading-relaxed text-justify text-slate-600 font-medium italic border-l-4 border-slate-100 pl-4 py-1">
            {data.profile.summary || "学术综述内容将在此以两端对齐的排版形式完整展示。"}
          </p>
        </header>

        <div className="space-y-12">
          {/* EDUCATION */}
          {edu.length > 0 && (
            <section>
              <h2 className="text-[12px] font-black text-slate-900 tracking-[0.4em] uppercase border-b-2 border-slate-100 pb-1 mb-6">Education and Qualifications</h2>
              {edu.map(i => (
                <div key={i.id} className="mb-8 last:mb-0">
                  <div className="flex justify-between items-baseline mb-1 gap-4">
                    <h3 className="font-black text-[16px] text-slate-900 uppercase tracking-tight leading-tight">{i.degree || "Degree Name"}</h3>
                    <span className="text-[11px] font-black text-slate-500 tracking-tighter shrink-0">{i.period}</span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-400 mb-4">{i.school} {i.gpa && <span className="ml-2 text-slate-900 font-black">| GPA: {i.gpa}</span>}</p>
                  <div className="pl-1">{formatBulletPoints(i.description)}</div>
                </div>
              ))}
            </section>
          )}

          {/* WORK EXPERIENCE */}
          {exp.length > 0 && (
            <section>
              <h2 className="text-[12px] font-black text-slate-900 tracking-[0.4em] uppercase border-b-2 border-slate-100 pb-1 mb-6">Work Experience</h2>
              {exp.map(i => (
                <div key={i.id} className="mb-8 last:mb-0">
                  <div className="flex justify-between items-baseline mb-1 gap-4">
                    <h3 className="font-black text-[16px] text-slate-900 uppercase tracking-tight leading-tight">{i.position || "Position Name"}</h3>
                    <span className="text-[11px] font-black text-slate-500 tracking-tighter shrink-0">{i.period}</span>
                  </div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">{i.company}</p>
                  <div className="pl-1">{formatBulletPoints(i.description)}</div>
                </div>
              ))}
            </section>
          )}

          {/* RESEARCH */}
          {res.length > 0 && (
            <section>
              <h2 className="text-[12px] font-black text-slate-900 tracking-[0.4em] uppercase border-b-2 border-slate-100 pb-1 mb-6">Research Experience</h2>
              {res.map(i => (
                <div key={i.id} className="mb-8 last:mb-0 pl-5 border-l-2 border-slate-50">
                  <div className="flex justify-between items-baseline mb-1 gap-4">
                    <h3 className="font-black text-[15px] text-slate-900 uppercase tracking-tight leading-tight">{i.title || "Project Title"}</h3>
                    <span className="text-[11px] font-black text-slate-500 tracking-tighter shrink-0">{i.period}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 italic">{i.role}</p>
                  <div className="pl-1">{formatBulletPoints(i.description)}</div>
                </div>
              ))}
            </section>
          )}

          {/* SKILLS */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-[12px] font-black text-slate-900 tracking-[0.4em] uppercase border-b-2 border-slate-100 pb-1 mb-6">Skills</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-bold text-slate-700 leading-none">
                {skills.map(s => (
                  <div key={s} className="flex items-center gap-2 uppercase tracking-tight"><span className="text-indigo-900">•</span>{s}</div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

// --- 通用输入组件 ---
function Input({ label, value, onChange, placeholder, hint, error, required }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className={`text-[10px] font-black uppercase tracking-widest ${error ? 'text-red-500' : 'text-slate-400'}`}>
          {label} {required && <span className="text-red-500 ml-1 font-black">*</span>}
        </label>
        {hint && !error && <span className="text-[9px] text-slate-400 font-bold uppercase italic tracking-tighter bg-slate-100 px-2 py-0.5 rounded">{hint}</span>}
      </div>
      <div className="relative">
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className={`w-full p-4 bg-white border-2 rounded-2xl outline-none text-sm font-bold shadow-sm transition-all ${
            error ? 'border-red-400 focus:ring-4 focus:ring-red-50' : 
            required && !value ? 'border-amber-100' : 'border-slate-100 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-900'
          }`} 
          placeholder={placeholder || `请输入${label}...`} 
        />
        {error && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"><AlertCircle size={18} /></div>}
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold ml-2">{error}</p>}
    </div>
  );
}

function SkillSection({ title, list, set }) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</label>
        <button onClick={() => set([...list, ""])} className="text-[11px] text-slate-900 font-black hover:underline uppercase">+ 增加项</button>
      </div>
      <div className="flex flex-wrap gap-4">
        {list.map((s, i) => (
          <div key={i} className="px-5 py-2.5 bg-white border-2 border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm hover:border-slate-900 transition-all group">
            <input value={s} placeholder="点击输入" onChange={e => { const n = [...list]; n[i] = e.target.value; set(n); }} className="bg-transparent outline-none text-sm font-bold w-28" />
            <button onClick={() => set(list.filter((_, idx) => idx !== i))}><X size={14} className="text-slate-300 hover:text-red-500"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}