/* Sample scholarship dataset (illustrative only).
   Fields: lv = levels, f = fields, c = categories, g = gender,
   mm = minimum marks %, inc = max family income (₹ lakh), docs = required documents.
   Deadlines are generated relative to today so the demo never goes stale. */
const inDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const APPLY_URL = "https://example.org/official-portal"; // placeholder: replace with real portal links

const SCHOLARSHIPS = [
  {id:1,name:"National Merit Excellence Grant",provider:"Education Ministry (sample)",amount:50000,deadline:inDays(21),lv:["ug","pg"],mm:70,inc:8,docs:["Marksheet","Income certificate","Aadhaar","Bank passbook"],about:"Rewards consistently high academic performance."},
  {id:2,name:"Women in Tech Scholarship",provider:"TechBridge Foundation (sample)",amount:75000,deadline:inDays(9),lv:["ug","pg"],f:["tech"],g:"Female",mm:60,inc:10,docs:["Marksheet","College ID","Statement of purpose","Aadhaar"],about:"Supports women pursuing technology degrees."},
  {id:3,name:"SC/ST Post-Matric Support",provider:"State Welfare Dept (sample)",amount:30000,deadline:inDays(45),lv:["ug","pg"],c:["SC","ST"],inc:2.5,docs:["Caste certificate","Income certificate","Marksheet","Bank passbook"],about:"Financial support for post-matric education."},
  {id:4,name:"Future Coders Fellowship",provider:"OpenCode Trust (sample)",amount:100000,deadline:inDays(30),lv:["ug"],f:["tech"],mm:75,inc:12,docs:["Marksheet","GitHub/portfolio link","Recommendation letter","Aadhaar"],about:"For undergraduates who build real projects."},
  {id:5,name:"EWS Education Aid",provider:"Central Scheme (sample)",amount:25000,deadline:inDays(14),lv:["ug","pg","school"],c:["EWS","General"],inc:3,docs:["EWS certificate","Income certificate","Marksheet"],about:"Helps economically weaker students continue studies."},
  {id:6,name:"Young Scientist Award",provider:"Science Council (sample)",amount:60000,deadline:inDays(60),lv:["ug","pg"],f:["sci","tech"],mm:80,docs:["Marksheet","Project abstract","Recommendation letter"],about:"Recognises research potential in science and tech."},
  {id:7,name:"OBC Higher Study Scholarship",provider:"Backward Classes Board (sample)",amount:35000,deadline:inDays(5),lv:["ug","pg"],c:["OBC"],inc:4.5,docs:["Caste certificate","Income certificate","Marksheet","Aadhaar"],about:"Support for OBC students in higher education."},
  {id:8,name:"Medical Aspirants Bursary",provider:"HealthFirst Trust (sample)",amount:120000,deadline:inDays(40),lv:["ug","pg"],f:["med"],mm:70,inc:6,docs:["Marksheet","Admission letter","Income certificate"],about:"Covers fees for medical students."},
  {id:9,name:"School Topper Stipend",provider:"District Trust (sample)",amount:12000,deadline:inDays(25),lv:["school"],mm:85,inc:5,docs:["Marksheet","School certificate","Parent ID"],about:"Annual stipend for top school performers."}
];
