import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Layout, 
  Code, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Camera, 
  CheckCircle2, 
  FileText, 
  Edit3, 
  Crown, 
  Check,
  Upload,
  X
} from 'lucide-react';

// --- API Configuration ---
const apiKey = ""; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const EMPTY_DATA = {
  themeColor: "#1e3a8a", 
  showPhoto: true,
  profile: {
    name: "",
    title: "",
    phone: "",
    email: "",
    location: "",
    website: "",
    summary: "",
    photo: null 
  },
  education: [
    { id: 'initial-edu', school: "", degree: "", period: "", description: "", gpa: "", courses: "" }
  ],
  research: [
    { id: 'initial-res', title: "", role: "", period: "", description: "" }
  ],
  experience: [
    { id: 'initial-exp', company: "", position: "", period: "", description: "" }
  ],
  skills: [],
  languages: [],
  hobbies: []
};

const STEPS = [
  { id: 'profile', label: '个人信息', icon: User },
  { id: 'education', label: '教育背景', icon: GraduationCap },
  { id: 'research', label: '研究项目', icon: BookOpen },
  { id: 'experience', label: '职业经历', icon: Briefcase },
  { id: 'skills', label: '技能特长', icon: Settings },
  { id: 'preview', label: '选择风格', icon: FileText },
];

const TEMPLATES = [
  { id: 'basic', name: '极简黑白', type: 'free', description: '纯净文字排版，无任何装饰' },
  { id: 'modern', name: '职场精英', type: 'premium', description: '现代图标与商务色彩点缀' },
  { id: 'academic', name: '学术泰斗', type: 'premium', description: '严谨的线条感，强调学术成就' },
  { id: 'creative', name: '创意领航', type: 'premium', description: '左右分栏布局，极具视觉冲击' }
];

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState(EMPTY_DATA);
  const [isPolishing, setIsPolishing] = useState(null);
  const [template, setTemplate] = useState('basic');

  const handleProfileChange = (field, value) => {
    setResumeData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfileChange('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    handleProfileChange('photo', null);
  };

  const handleListChange = (type, id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = (type) => {
    const newItem = { id: Date.now(), company: "", position: "", period: "", description: "", school: "", degree: "", title: "", role: "", gpa: "", courses: "" };
    setResumeData(prev => ({ ...prev, [type]: [...prev[type], newItem] }));
  };

  const deleteItem = (type, id) => {
    setResumeData(prev => ({ ...prev, [type]: prev[type].filter(item => item.id !== id) }));
  };

  const polishText = async (section, id, currentText) => {
    if (!currentText) return;
    setIsPolishing(id || section);
    try {
      const prompt = `You are a professional career coach. Optimize the following description using the STAR principle. Use strong action verbs. Output ONLY the optimized text. Content:\n"${currentText}"`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      const polishedText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || currentText;
      if (section === 'profile') handleProfileChange('summary', polishedText);
      else handleListChange(section, id, 'description', polishedText);
    } catch (e) { console.error(e); } finally { setIsPolishing(null); }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  const renderResumeContent = () => {
    switch (template) {
      case 'modern': return <ModernTemplate data={resumeData} />;
      case 'academic': return <AcademicTemplate data={resumeData} />;
      case 'creative': return <CreativeTemplate data={resumeData} />;
      default: return <BasicTemplate data={resumeData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded text-white shadow-lg"><FileText size={20} /></div>
          <h1 className="text-lg font-bold tracking-tight">AI 简历工作流</h1>
        </div>
        {isLastStep && (
          <div className="flex gap-4">
             <button onClick={() => setCurrentStep(0)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs">
                <Edit3 size={14}/> 返回修改
             </button>
             <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all">
                <Download size={14} /> 打印 PDF
             </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-4 md:p-12 overflow-y-auto">
        <div className={`w-full ${isLastStep ? 'max-w-[210mm]' : 'max-w-4xl'} transition-all`}>
          
          {!isLastStep ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                    {React.createElement(STEPS[currentStep].icon, { size: 24 })}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{STEPS[currentStep].label}</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Step {currentStep + 1} / 5</p>
                  </div>
                </div>

                {STEPS[currentStep].id === 'profile' && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-indigo-400">
                          {resumeData.profile.photo ? (
                            <img src={resumeData.profile.photo} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <Camera size={32} className="text-slate-300" />
                          )}
                        </div>
                        {resumeData.profile.photo && (
                          <button 
                            onClick={removePhoto}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="font-bold text-slate-800 mb-1">个人照片</h3>
                        <p className="text-[11px] text-slate-400 mb-4">建议使用 1:1 比例的正装照</p>
                        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-900 text-white rounded-2xl text-xs font-bold cursor-pointer hover:bg-black transition-all shadow-sm">
                          <Upload size={14} />
                          {resumeData.profile.photo ? '更换照片' : '上传照片'}
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">显示照片</span>
                        <button 
                          onClick={() => setResumeData(prev => ({...prev, showPhoto: !prev.showPhoto}))}
                          className={`w-10 h-5 rounded-full transition-all relative ${resumeData.showPhoto ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${resumeData.showPhoto ? 'left-6' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="姓名" value={resumeData.profile.name} onChange={v => handleProfileChange('name', v)} />
                      <InputGroup label="意向职位" value={resumeData.profile.title} onChange={v => handleProfileChange('title', v)} />
                      <InputGroup label="联系电话" value={resumeData.profile.phone} onChange={v => handleProfileChange('phone', v)} />
                      <InputGroup label="电子邮箱" value={resumeData.profile.email} onChange={v => handleProfileChange('email', v)} />
                      <div className="md:col-span-2">
                         <div className="flex justify-between items-center mb-2 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">专业总结</label>
                            <button onClick={() => polishText('profile', null, resumeData.profile.summary)} disabled={isPolishing === 'profile'} className="text-[10px] text-indigo-600 font-black flex items-center gap-1.5 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                               <Sparkles size={12} className={isPolishing === 'profile' ? 'animate-spin' : ''}/> AI 深度润色
                            </button>
                         </div>
                         <textarea rows="4" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none outline-none focus:ring-1 focus:ring-slate-300 transition-all shadow-inner" value={resumeData.profile.summary} onChange={e => handleProfileChange('summary', e.target.value)} placeholder="输入一段简介..." />
                      </div>
                    </div>
                  </div>
                )}

                {(['education', 'research', 'experience'].includes(STEPS[currentStep].id)) && (
                   <div className="space-y-6 animate-in slide-in-from-bottom-2">
                      {resumeData[STEPS[currentStep].id].map((item) => (
                         <div key={item.id} className="p-6 bg-slate-50 rounded-3xl relative border border-slate-100 shadow-sm transition-all hover:bg-slate-50/80">
                            <button onClick={() => deleteItem(STEPS[currentStep].id, item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                               <InputGroup label="机构/名称" value={item.school || item.title || item.company} onChange={v => handleListChange(STEPS[currentStep].id, item.id, item.school ? 'school' : item.title ? 'title' : 'company', v)} />
                               <InputGroup label="学位/角色" value={item.degree || item.role || item.position} onChange={v => handleListChange(STEPS[currentStep].id, item.id, item.degree ? 'degree' : item.role ? 'role' : 'position', v)} />
                               <InputGroup label="起止时间" value={item.period} onChange={v => handleListChange(STEPS[currentStep].id, item.id, 'period', v)} />
                               {STEPS[currentStep].id === 'education' && <InputGroup label="成绩/GPA" value={item.gpa} onChange={v => handleListChange('education', item.id, 'gpa', v)} />}
                               <div className="md:col-span-2 space-y-2">
                                  <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">详细描述</label>
                                    <button onClick={() => polishText(STEPS[currentStep].id, item.id, item.description)} className="text-[10px] text-indigo-600 font-black hover:underline">AI 优化</button>
                                  </div>
                                  <textarea className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-xs shadow-sm leading-relaxed" rows="3" value={item.description} onChange={e => handleListChange(STEPS[currentStep].id, item.id, 'description', e.target.value)} placeholder="描述您的具体职责或成果..." />
                               </div>
                            </div>
                         </div>
                      ))}
                      <button onClick={() => addItem(STEPS[currentStep].id)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-slate-300 transition-all"><Plus size={18}/> 增加一项经历</button>
                   </div>
                )}

                {STEPS[currentStep].id === 'skills' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <p className="text-sm text-slate-500 ml-1 font-medium">请添加您的专业技能或工具标签。</p>
                    <div className="flex flex-wrap gap-3">
                      {resumeData.skills.map((s, i) => (
                        <div key={i} className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-sm flex items-center gap-2 font-bold shadow-sm group hover:border-indigo-300 transition-all">
                           <input 
                              value={s} 
                              placeholder="Skill"
                              onChange={e => { 
                                 const n = [...resumeData.skills]; 
                                 n[i] = e.target.value; 
                                 setResumeData({...resumeData, skills: n}); 
                              }} 
                              className="w-24 bg-transparent outline-none placeholder:font-normal placeholder:text-slate-300" 
                           />
                           <button onClick={() => setResumeData({...resumeData, skills: resumeData.skills.filter((_, idx) => idx !== i)})} className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} className="text-slate-300 hover:text-red-500" /></button>
                        </div>
                      ))}
                      <button onClick={() => setResumeData({...resumeData, skills: [...resumeData.skills, ""]})} className="px-4 py-2 border-2 border-dashed rounded-2xl text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all font-bold text-sm">+</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 flex justify-between border-t gap-4">
                <button 
                  onClick={() => setCurrentStep(c => c - 1)} 
                  disabled={currentStep === 0} 
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${currentStep === 0 ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-white active:bg-slate-100'}`}
                >
                  <ChevronLeft size={16} /> 上一步
                </button>
                <button 
                  onClick={() => setCurrentStep(c => c + 1)} 
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black active:scale-[0.98] transition-all"
                >
                  下一步 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)} className={`p-5 rounded-3xl text-left transition-all border-2 relative overflow-hidden ${template === t.id ? 'border-slate-900 bg-white shadow-xl scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                    {t.type === 'premium' && <div className="absolute top-3 right-3 text-amber-500"><Crown size={14}/></div>}
                    <span className="text-xs font-black uppercase block mb-1 tracking-tighter">{t.name}</span>
                    <p className="text-[10px] text-slate-400 leading-tight font-medium">{t.description}</p>
                    {template === t.id && <Check size={12} className="absolute bottom-3 right-3 text-indigo-600" />}
                  </button>
                ))}
              </div>
              <div className="print:m-0">
                {renderResumeContent()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Template Components ---

const BasicTemplate = ({ data }) => (
  <div className="bg-white p-16 min-h-[297mm] font-serif text-slate-900 leading-normal border shadow-sm print:border-0 print:shadow-none">
    <header className="text-center mb-10">
      <h1 className="text-4xl uppercase mb-2 tracking-tighter font-bold">{data.profile.name || "您的姓名"}</h1>
      <p className="text-sm underline underline-offset-4 decoration-slate-200">{data.profile.email} {data.profile.phone}</p>
    </header>
    <section className="mb-8"><h2 className="font-bold border-b border-slate-900 mb-4 uppercase text-sm tracking-widest">简介</h2><p className="text-sm leading-relaxed text-justify whitespace-pre-wrap">{data.profile.summary || "尚未填写个人简介。"}</p></section>
    
    <div className="space-y-8">
      {data.education.filter(e => e.school).length > 0 && (
        <section>
          <h2 className="font-bold border-b border-slate-900 mb-4 uppercase text-sm tracking-widest">教育背景</h2>
          {data.education.filter(e => e.school).map(e => (
            <div key={e.id} className="mb-4 text-sm">
              <div className="font-bold flex justify-between"><span>{e.school}</span><span>{e.period}</span></div>
              <p className="text-xs italic">{e.degree} {e.gpa ? `| GPA: ${e.gpa}` : ""}</p>
            </div>
          ))}
        </section>
      )}
      {data.experience.filter(e => e.company).length > 0 && (
        <section>
          <h2 className="font-bold border-b border-slate-900 mb-4 uppercase text-sm tracking-widest">工作经历</h2>
          {data.experience.filter(e => e.company).map(e => (
            <div key={e.id} className="mb-4 text-sm">
              <div className="font-bold flex justify-between"><span>{e.company}</span><span>{e.period}</span></div>
              <p className="text-xs italic mb-1">{e.position}</p>
              <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{e.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  </div>
);

const ModernTemplate = ({ data }) => (
  <div className="bg-white p-[20mm] min-h-[297mm] shadow-2xl font-sans text-slate-800 border-t-[16px] border-indigo-900 print:shadow-none">
    <div className="flex justify-between items-start mb-10">
      <div className="flex-1">
        <h1 className="text-5xl font-black text-indigo-900 mb-2 uppercase tracking-tighter leading-none">{data.profile.name || "姓名"}</h1>
        <p className="text-xl font-bold text-slate-400 tracking-widest">{data.profile.title || "职位"}</p>
      </div>
      {data.showPhoto && data.profile.photo && (
        <div className="w-28 h-28 border-4 border-indigo-50 rounded-3xl overflow-hidden shadow-lg ml-8">
          <img src={data.profile.photo} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
    
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-8 space-y-10">
        <section>
          <h2 className="text-xs font-black uppercase text-indigo-900 border-b-2 border-indigo-50 mb-5 tracking-widest">职业经历</h2>
          {data.experience.filter(e => e.company).map(e => (
            <div key={e.id} className="mb-6">
              <div className="font-black text-sm text-slate-900 flex justify-between"><span>{e.company}</span><span className="text-indigo-600 text-[10px]">{e.period}</span></div>
              <p className="text-[11px] font-bold text-slate-400 mb-2">{e.position}</p>
              <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{e.description}</p>
            </div>
          ))}
        </section>
      </div>
      <div className="col-span-4 space-y-10">
        <section>
          <h2 className="text-xs font-black uppercase text-indigo-900 border-b-2 border-indigo-50 mb-5 tracking-widest">联系方式</h2>
          <div className="space-y-3 text-[11px] font-bold text-slate-600">
            {data.profile.email && <p className="flex items-center gap-2"><Mail size={12}/> {data.profile.email}</p>}
            {data.profile.phone && <p className="flex items-center gap-2"><Phone size={12}/> {data.profile.phone}</p>}
            {data.profile.location && <p className="flex items-center gap-2"><MapPin size={12}/> {data.profile.location}</p>}
          </div>
        </section>
        {data.skills.filter(s => s).length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase text-indigo-900 border-b-2 border-indigo-50 mb-5 tracking-widest">技能</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.filter(s => s).map(s => <span key={s} className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-tighter">{s}</span>)}
            </div>
          </section>
        )}
      </div>
    </div>
  </div>
);

const AcademicTemplate = ({ data }) => (
  <div className="bg-white p-[20mm] min-h-[297mm] shadow-2xl font-serif text-slate-900 text-center print:shadow-none">
    <h1 className="text-3xl font-bold mb-6 tracking-[0.2em] uppercase">{data.profile.name || "CURRICULUM VITAE"}</h1>
    <div className="text-sm italic mb-10 border-y border-slate-100 py-4 font-medium">
      {data.profile.location} {data.profile.location && "•"} {data.profile.email} {data.profile.email && "•"} {data.profile.phone}
    </div>
    <div className="text-left space-y-10 max-w-3xl mx-auto">
      <section>
        <h2 className="font-bold text-center border-b border-slate-200 pb-1 mb-6 uppercase text-sm tracking-[0.3em]">Education</h2>
        {data.education.filter(e => e.school).map(e => (
          <div key={e.id} className="text-sm mb-6">
            <div className="font-bold flex justify-between italic"><span>{e.school}</span><span>{e.period}</span></div>
            <p className="text-xs mt-1">{e.degree} {e.gpa && `| GPA: ${e.gpa}`}</p>
          </div>
        ))}
      </section>
    </div>
  </div>
);

const CreativeTemplate = ({ data }) => (
  <div className="bg-white min-h-[297mm] shadow-2xl flex overflow-hidden font-sans print:shadow-none">
    <aside className="w-[85mm] bg-slate-900 text-white p-12 flex flex-col">
      {data.showPhoto && data.profile.photo ? (
        <div className="w-full aspect-square rounded-[2rem] overflow-hidden mb-10 shadow-2xl ring-4 ring-white/10">
          <img src={data.profile.photo} alt="Avatar" className="w-full h-full object-cover scale-110" />
        </div>
      ) : (
        <h1 className="text-3xl font-black mb-10 uppercase leading-none tracking-tighter">{data.profile.name || "姓名"}</h1>
      )}
      <div className="space-y-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 underline decoration-indigo-500 decoration-2 underline-offset-8">联系方式</h3>
          <p className="text-xs font-bold text-slate-300 break-all leading-relaxed">
            {data.profile.email}<br/>
            {data.profile.phone}
          </p>
        </div>
        {data.skills.filter(s => s).length > 0 && (
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 underline decoration-indigo-500 decoration-2 underline-offset-8">技能特长</h3>
            <div className="space-y-2">
              {data.skills.filter(s => s).map(s => <div key={s} className="text-[10px] font-black uppercase tracking-widest bg-white/5 p-2.5 rounded-xl text-slate-300 border border-white/5">{s}</div>)}
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto pt-10 border-t border-white/5 italic text-[11px] text-slate-500 leading-relaxed font-medium">
        {data.profile.summary}
      </div>
    </aside>
    <main className="flex-1 p-16 bg-white">
      <h2 className="text-2xl font-black uppercase mb-12 border-b-8 border-slate-900 inline-block tracking-tighter">职业经历</h2>
      <div className="space-y-12">
        {data.experience.filter(e => e.company).map(e => (
          <div key={e.id} className="relative pl-6 border-l-2 border-slate-100">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-900"></div>
            <h4 className="font-black text-sm uppercase text-slate-900 mb-1">{e.company}</h4>
            <p className="text-[11px] font-black text-indigo-600 mb-3 tracking-widest uppercase">{e.position} | {e.period}</p>
            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{e.description}</p>
          </div>
        ))}
      </div>
    </main>
  </div>
);

const InputGroup = ({ label, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-200 outline-none text-sm font-bold transition-all shadow-sm placeholder:font-normal" placeholder={`请输入${label}`} />
  </div>
);

export default App;