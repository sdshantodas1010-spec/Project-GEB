/* GEB Hub: বায়োটেক টুলবক্সের ডেটা (GENESIS 22: ১ম বর্ষ ২য় সেমিস্টারের জন্য ছাঁটা)
   ENZYMES: n নাম, s সাইট (IUPAC), t/b উপরের/নিচের স্ট্র্যান্ডে সাইটের শুরু থেকে কাটার জায়গা, c=1 হলে "সাধারণ" তালিকায়।
   PROTOCOLS/RECIPES/REAGENTS: যোগ বা বদলাতে এই ফাইলই এডিট করুন (JSON-এর মতো)। প্রোটোকলের ধাপগুলো সাধারণ পাঠ্যবই মানের নমুনা;
   আপনার ল্যাবের ম্যানুয়াল বা শিক্ষকের নির্দেশ সব সময় আগে। */
(function (w) {
  var D = w.GEBData = w.GEBData || {};
  var X = {
 "ENZYMES": [
  {
   "n": "EcoRI",
   "s": "GAATTC",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "BamHI",
   "s": "GGATCC",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "HindIII",
   "s": "AAGCTT",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "XhoI",
   "s": "CTCGAG",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "XbaI",
   "s": "TCTAGA",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "SalI",
   "s": "GTCGAC",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "PstI",
   "s": "CTGCAG",
   "t": 5,
   "b": 1,
   "c": 1
  },
  {
   "n": "SacI",
   "s": "GAGCTC",
   "t": 5,
   "b": 1,
   "c": 1
  },
  {
   "n": "KpnI",
   "s": "GGTACC",
   "t": 5,
   "b": 1,
   "c": 1
  },
  {
   "n": "NcoI",
   "s": "CCATGG",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "NdeI",
   "s": "CATATG",
   "t": 2,
   "b": 4,
   "c": 1
  },
  {
   "n": "NotI",
   "s": "GCGGCCGC",
   "t": 2,
   "b": 6,
   "c": 1
  },
  {
   "n": "SmaI",
   "s": "CCCGGG",
   "t": 3,
   "b": 3,
   "c": 1
  },
  {
   "n": "EcoRV",
   "s": "GATATC",
   "t": 3,
   "b": 3,
   "c": 1
  },
  {
   "n": "SphI",
   "s": "GCATGC",
   "t": 5,
   "b": 1,
   "c": 1
  },
  {
   "n": "ClaI",
   "s": "ATCGAT",
   "t": 2,
   "b": 4,
   "c": 1
  },
  {
   "n": "NheI",
   "s": "GCTAGC",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "SpeI",
   "s": "ACTAGT",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "BglII",
   "s": "AGATCT",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "MluI",
   "s": "ACGCGT",
   "t": 1,
   "b": 5,
   "c": 1
  },
  {
   "n": "XmaI",
   "s": "CCCGGG",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "ApaI",
   "s": "GGGCCC",
   "t": 5,
   "b": 1,
   "c": 0
  },
  {
   "n": "AvrII",
   "s": "CCTAGG",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "HpaI",
   "s": "GTTAAC",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "PvuII",
   "s": "CAGCTG",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "PvuI",
   "s": "CGATCG",
   "t": 4,
   "b": 2,
   "c": 0
  },
  {
   "n": "ScaI",
   "s": "AGTACT",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "BspEI",
   "s": "TCCGGA",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "AgeI",
   "s": "ACCGGT",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "NsiI",
   "s": "ATGCAT",
   "t": 5,
   "b": 1,
   "c": 0
  },
  {
   "n": "SacII",
   "s": "CCGCGG",
   "t": 4,
   "b": 2,
   "c": 0
  },
  {
   "n": "StuI",
   "s": "AGGCCT",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "SnaBI",
   "s": "TACGTA",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "BsrGI",
   "s": "TGTACA",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "AatII",
   "s": "GACGTC",
   "t": 5,
   "b": 1,
   "c": 0
  },
  {
   "n": "BclI",
   "s": "TGATCA",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "BsiWI",
   "s": "CGTACG",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "ApaLI",
   "s": "GTGCAC",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "AflII",
   "s": "CTTAAG",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "BstBI",
   "s": "TTCGAA",
   "t": 2,
   "b": 4,
   "c": 0
  },
  {
   "n": "BspHI",
   "s": "TCATGA",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "PciI",
   "s": "ACATGT",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "EagI",
   "s": "CGGCCG",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "NruI",
   "s": "TCGCGA",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "KasI",
   "s": "GGCGCC",
   "t": 1,
   "b": 5,
   "c": 0
  },
  {
   "n": "NaeI",
   "s": "GCCGGC",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "DraI",
   "s": "TTTAAA",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "SspI",
   "s": "AATATT",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "HaeIII",
   "s": "GGCC",
   "t": 2,
   "b": 2,
   "c": 0
  },
  {
   "n": "AluI",
   "s": "AGCT",
   "t": 2,
   "b": 2,
   "c": 0
  },
  {
   "n": "TaqI",
   "s": "TCGA",
   "t": 1,
   "b": 3,
   "c": 0
  },
  {
   "n": "MspI",
   "s": "CCGG",
   "t": 1,
   "b": 3,
   "c": 0
  },
  {
   "n": "HhaI",
   "s": "GCGC",
   "t": 3,
   "b": 1,
   "c": 0
  },
  {
   "n": "Sau3AI",
   "s": "GATC",
   "t": 0,
   "b": 4,
   "c": 0
  },
  {
   "n": "HincII",
   "s": "GTYRAC",
   "t": 3,
   "b": 3,
   "c": 0
  },
  {
   "n": "AccI",
   "s": "GTMKAC",
   "t": 2,
   "b": 4,
   "c": 0
  },
  {
   "n": "BstEII",
   "s": "GGTNACC",
   "t": 1,
   "b": 6,
   "c": 0
  },
  {
   "n": "XmnI",
   "s": "GAANNNNTTC",
   "t": 5,
   "b": 5,
   "c": 0
  },
  {
   "n": "SfiI",
   "s": "GGCCNNNNNGGCC",
   "t": 8,
   "b": 5,
   "c": 0
  },
  {
   "n": "BsaI",
   "s": "GGTCTC",
   "t": 7,
   "b": 11,
   "c": 0
  },
  {
   "n": "BsmBI",
   "s": "CGTCTC",
   "t": 7,
   "b": 11,
   "c": 0
  },
  {
   "n": "BbsI",
   "s": "GAAGAC",
   "t": 8,
   "b": 12,
   "c": 0
  },
  {
   "n": "FokI",
   "s": "GGATG",
   "t": 14,
   "b": 18,
   "c": 0
  }
 ],
 "SAMPLE_SEQ": "TTTGGTATTAAGAATTTGCAGTACGAATTCCATATGACACGGGGCATCTCGTTCCTGAGTGTTGTAGGCGTGTCGCTGGTGGTCGCCCAAATTGGCCCGTCTAAATGCTCAGCGACGAGGTCCACTGTATTGTACCACCTAGAGCGTTCACAAGAATGTGAGTGGGAGTTGGCAGGTCTGATAATGGCTAAACCGCGACTAGACGAGATTTCAGTTGCCCACGGTACTAGAGCCGCACCTCCAAGTTATGAAGGCGAACGCATGAGCACCTCCACCAATGTTGTGCCCGACACTTTGGACGGAACCCCAAGTCGTGATCTAGTAGTAAAACTTGCGCGGCGCTTCCCAAAATCCAAGTGCATTATAGCATCCGATTACCGATTTTTCAGCGCAAACTATTCAAGTGGGATCGATGGGATAACTTCCCAAATCCACAACTTCCATTACTCGCATTGTCCAGGAACACGACGTAATTCACCAGAGGCTATAAGGTGCTCTCATTCCGGGGACCCGTACGATACACCCTACCTTCTGTTACTGAGAGTGCACGCTAGGGAAAGACGTCGTACACGCGCTAGTTATATCATACGGTTGCCTTGGTGTTATACTGAAATGCGAATATGCAGGTCCCGTAACCCAATGGGGGGCAACAGCTGTGGACGTGAACGTGGGGCAACTCAACATCTCCCTCAACAAGTTGATTGCTCGCGACTCATTTCCATCACTACGAGCGCAACGGTGCCGTATGAGTAAGGATCCAAGCTTCTCGAGTTTAGCCACAGCAGTTCA",
 "REAGENTS": [
  [
   "NaCl (সোডিয়াম ক্লোরাইড)",
   58.44
  ],
  [
   "KCl (পটাসিয়াম ক্লোরাইড)",
   74.55
  ],
  [
   "Tris base",
   121.14
  ],
  [
   "Tris-HCl",
   157.6
  ],
  [
   "EDTA, disodium dihydrate (Na₂EDTA·2H₂O)",
   372.24
  ],
  [
   "EDTA, free acid",
   292.24
  ],
  [
   "MgCl₂ (anhydrous)",
   95.21
  ],
  [
   "MgCl₂·6H₂O",
   203.3
  ],
  [
   "CaCl₂ (anhydrous)",
   110.98
  ],
  [
   "CaCl₂·2H₂O",
   147.01
  ],
  [
   "Glucose",
   180.16
  ],
  [
   "Sucrose",
   342.3
  ],
  [
   "SDS",
   288.38
  ],
  [
   "NaOH",
   40
  ],
  [
   "Glycine",
   75.07
  ],
  [
   "Boric acid",
   61.83
  ],
  [
   "Na₂HPO₄ (anhydrous)",
   141.96
  ],
  [
   "NaH₂PO₄ (anhydrous)",
   119.98
  ],
  [
   "KH₂PO₄",
   136.09
  ],
  [
   "Sodium acetate (anhydrous)",
   82.03
  ],
  [
   "Sodium acetate trihydrate",
   136.08
  ],
  [
   "Ammonium persulfate (APS)",
   228.2
  ],
  [
   "Acrylamide",
   71.08
  ],
  [
   "IPTG",
   238.3
  ],
  [
   "Ammonium sulfate",
   132.14
  ]
 ],
 "ACIDS": [
  [
   "HCl, ঘন (37%)",
   37,
   1.19,
   36.46
  ],
  [
   "Acetic acid, glacial (~99.7%)",
   99.7,
   1.049,
   60.05
  ],
  [
   "H₂SO₄, ঘন (98%)",
   98,
   1.84,
   98.08
  ],
  [
   "HNO₃, ঘন (~70%)",
   70,
   1.41,
   63.01
  ],
  [
   "Ethanol, absolute (~99.8%)",
   99.8,
   0.789,
   46.07
  ]
 ],
 "RECIPES": [
  {
   "id": "tris8",
   "t": "1 M Tris-HCl, pH 8.0",
   "base": 1000,
   "items": [
    [
     "Tris base",
     121.1,
     "g"
    ],
    [
     "ঘন HCl (pH ৮.০-এর জন্য প্রায়)",
     42,
     "ml"
    ]
   ],
   "note": "অর্ধেক পানিতে Tris গুলে ধীরে ধীরে HCl দিয়ে pH ৮.০ করুন। Tris-এর pH তাপমাত্রায় বদলায়, তাই ব্যবহারের তাপমাত্রায় pH মাপুন।"
  },
  {
   "id": "edta",
   "t": "0.5 M EDTA, pH 8.0",
   "base": 1000,
   "items": [
    [
     "Na₂EDTA·2H₂O",
     186.1,
     "g"
    ],
    [
     "NaOH pellets (pH ঠিক করতে, প্রায়)",
     20,
     "g"
    ]
   ],
   "note": "EDTA শুধু pH ৮.০-এর কাছে গলে। আগে অর্ধেক পানিতে মেশান, NaOH দিয়ে pH ৮.০ করুন, তারপর আয়তন পূরণ করে অটোক্লেভ করুন।"
  },
  {
   "id": "te",
   "t": "TE buffer, pH 8.0 (10 mM Tris, 1 mM EDTA)",
   "base": 1000,
   "items": [
    [
     "1 M Tris-HCl, pH 8.0",
     10,
     "ml"
    ],
    [
     "0.5 M EDTA, pH 8.0",
     2,
     "ml"
    ]
   ],
   "note": "পানি দিয়ে আয়তন পূরণ করে অটোক্লেভ করুন।"
  },
  {
   "id": "pbs",
   "t": "PBS, 10× stock",
   "base": 1000,
   "items": [
    [
     "NaCl",
     80,
     "g"
    ],
    [
     "KCl",
     2,
     "g"
    ],
    [
     "Na₂HPO₄ (anhydrous)",
     14.4,
     "g"
    ],
    [
     "KH₂PO₄",
     2.4,
     "g"
    ]
   ],
   "note": "১০× থেকে ১:১০ পাতলা করে 1× PBS (pH ~৭.৪) হয়। অটোক্লেভ করুন।"
  },
  {
   "id": "saline",
   "t": "Physiological saline (0.85% NaCl)",
   "base": 1000,
   "items": [
    [
     "NaCl",
     8.5,
     "g"
    ]
   ],
   "note": "সিরিয়াল ডাইলুশনের ডাইলুয়েন্ট হিসেবে ব্যবহার হয়। অটোক্লেভ করুন।"
  },
  {
   "id": "etoh70",
   "t": "70% ethanol (v/v)",
   "base": 100,
   "items": [
    [
     "Absolute ethanol",
     70,
     "ml"
    ],
    [
     "পানি",
     30,
     "ml"
    ]
   ],
   "note": "হাত ও বেঞ্চ জীবাণুমুক্ত করতে এবং DNA পেলেট ধুতে।"
  },
  {
   "id": "nacl5",
   "t": "5 M NaCl",
   "base": 1000,
   "items": [
    [
     "NaCl",
     292.2,
     "g"
    ]
   ],
   "note": "গুলে আয়তন পূরণ করুন, অটোক্লেভ করুন।"
  },
  {
   "id": "naac",
   "t": "3 M sodium acetate, pH 5.2",
   "base": 100,
   "items": [
    [
     "Sodium acetate trihydrate",
     40.8,
     "g"
    ]
   ],
   "note": "গ্লেসিয়াল অ্যাসেটিক অ্যাসিড দিয়ে pH ৫.২ করুন, অটোক্লেভ করুন। DNA ইথানল প্রেসিপিটেশনে।"
  },
  {
   "id": "sds10",
   "t": "10% SDS",
   "base": 100,
   "items": [
    [
     "SDS",
     10,
     "g"
    ]
   ],
   "note": "৬৮°C-এ গরম করে গুলুন, অটোক্লেভ করবেন না। গুঁড়া মাপার সময় মাস্ক পরুন।"
  },
  {
   "id": "aps10",
   "t": "10% APS (ammonium persulfate)",
   "base": 10,
   "items": [
    [
     "APS",
     1,
     "g"
    ]
   ],
   "note": "টাটকা বানানো সবচেয়ে ভালো (৪°C-এ কয়েক দিন চলে)। SDS-PAGE জেল জমাতে।"
  },
  {
   "id": "run10",
   "t": "SDS-PAGE running buffer, 10×",
   "base": 1000,
   "items": [
    [
     "Tris base",
     30.3,
     "g"
    ],
    [
     "Glycine",
     144,
     "g"
    ],
    [
     "SDS",
     10,
     "g"
    ]
   ],
   "note": "১:১০ পাতলা করে ব্যবহার করুন (25 mM Tris, 192 mM glycine, 0.1% SDS)। pH ঠিক করার দরকার নেই (~৮.৩)।"
  },
  {
   "id": "coom",
   "t": "Coomassie staining solution",
   "base": 1000,
   "items": [
    [
     "Coomassie Brilliant Blue R-250",
     1,
     "g"
    ],
    [
     "Methanol",
     400,
     "ml"
    ],
    [
     "Glacial acetic acid",
     100,
     "ml"
    ],
    [
     "পানি",
     500,
     "ml"
    ]
   ],
   "note": "০.১% R-250, ৪০% মেথানল, ১০% অ্যাসেটিক অ্যাসিড। ডিস্টেইন: ৪০% মেথানল + ১০% অ্যাসেটিক অ্যাসিড (রঞ্জক ছাড়া)।"
  },
  {
   "id": "tae50",
   "t": "TAE buffer, 50× stock",
   "base": 1000,
   "items": [
    [
     "Tris base",
     242,
     "g"
    ],
    [
     "Glacial acetic acid",
     57.1,
     "ml"
    ],
    [
     "0.5 M EDTA (pH 8.0)",
     100,
     "ml"
    ]
   ],
   "note": "পানি দিয়ে মোট আয়তন করুন। ব্যবহারের সময় ১:৫০ পাতলা করুন (1× = 40 mM Tris, 20 mM acetate, 1 mM EDTA)।"
  },
  {
   "id": "tbe10",
   "t": "TBE buffer, 10× stock",
   "base": 1000,
   "items": [
    [
     "Tris base",
     108,
     "g"
    ],
    [
     "Boric acid",
     55,
     "g"
    ],
    [
     "0.5 M EDTA (pH 8.0)",
     40,
     "ml"
    ]
   ],
   "note": "ব্যবহারের সময় ১:১০ পাতলা করুন (1× = 89 mM Tris, 89 mM borate, 2 mM EDTA)।"
  },
  {
   "id": "dye6",
   "t": "6× DNA loading dye",
   "base": 10,
   "items": [
    [
     "Bromophenol blue",
     25,
     "mg"
    ],
    [
     "Xylene cyanol FF",
     25,
     "mg"
    ],
    [
     "Glycerol",
     3,
     "ml"
    ]
   ],
   "note": "পানি দিয়ে ১০ ml করুন (০.২৫% রঞ্জক, ৩০% গ্লিসারল)। ৪°C-এ রাখুন।"
  }
 ],
 "PROTOCOLS": [
  {
   "id": "gel",
   "t": "Agarose Gel Electrophoresis",
   "cat": "DNA",
   "aim": "To separate and visualise DNA fragments according to their size.",
   "mat": [
    "Agarose",
    "1× TAE or TBE buffer",
    "DNA stain (ethidium bromide, or a safer dye such as SYBR Safe or GelRed)",
    "6× loading dye",
    "DNA ladder",
    "Casting tray and comb, electrophoresis tank, power supply",
    "UV or blue-light transilluminator"
   ],
   "steps": [
    "Weigh the agarose for the required percentage (1% = 1 g per 100 ml of buffer; see the gel calculator).",
    "Add the agarose to 1× TAE in a flask (not more than one third full) and heat in a microwave, swirling, until the solution is completely clear.",
    "Cool to about 50–60 °C and add the stain (for example ethidium bromide to 0.5 µg/ml). Swirl gently without making bubbles.",
    "Pour into the sealed tray with the comb in place and let it set for 20–30 minutes.",
    "Remove the comb, place the gel in the tank and cover it with 1× running buffer to about 3–5 mm above the gel.",
    "Mix 5 µl of sample with 1 µl of 6× loading dye and load it into a well. Load a DNA ladder in one well.",
    "Run at about 5–8 V per cm of electrode distance (commonly 80–100 V) for 30–45 min, until the dye has moved about two thirds of the gel. DNA runs towards the positive electrode.",
    "Visualise on a transilluminator and photograph the gel."
   ],
   "tips": [
    "জেলের শতকরা হার: ০.৭% প্রায় ০.৮–১০ kb, ১% প্রায় ০.৫–৭ kb, ১.৫% প্রায় ০.২–৩ kb, ২% প্রায় ০.১–২ kb আলাদা করে। ছোট DNA-র জন্য বেশি %, বড় DNA-র জন্য কম % নিন।",
    "জেল বানানো ও চালানোর জন্য একই বাফার (TAE বা TBE) ব্যবহার করুন।",
    "ব্যান্ড ঝাপসা বা ছড়ানো হলে ভোল্টেজ কমান; কূপ ভরে গেলে নমুনা কম দিন।"
   ],
   "safe": "Ethidium bromide mutagen হতে পারে: গ্লাভস পরুন এবং বর্জ্য আলাদা পাত্রে ফেলুন। UV আলো থেকে চোখ ও ত্বক বাঁচান (ফেস শিল্ড বা গগলস)।",
   "go": "gel"
  },
  {
   "id": "quant",
   "t": "DNA / RNA Quantification (A260 / A280)",
   "cat": "DNA",
   "aim": "To measure the concentration and purity of nucleic acid by UV absorbance.",
   "mat": [
    "Spectrophotometer or microvolume spectrophotometer",
    "Quartz cuvette (for a conventional instrument)",
    "Buffer or water in which the sample is dissolved (blank)"
   ],
   "steps": [
    "Blank the instrument with the same buffer or water in which the nucleic acid is dissolved.",
    "Dilute the sample (for example 1:50 or 1:100) so that A260 falls between about 0.1 and 1.0.",
    "Read the absorbance at 230, 260 and 280 nm.",
    "Concentration (µg/ml) = A260 × dilution factor × 50 for double-stranded DNA (×40 for RNA, ×33 for single-stranded DNA).",
    "Purity: A260/A280 is about 1.8 for pure DNA and about 2.0 for pure RNA; A260/A230 should be about 2.0–2.2."
   ],
   "tips": [
    "প্রোটিন বা ফেনল থেকে গেলে A260/A280 কমে যায়; ফেনল, লবণ ও কার্বোহাইড্রেট থাকলে A260/A230 কমে।",
    "A260/A280 শুধু বিশুদ্ধতার ধারণা দেয়, DNA অক্ষত কি না জানতে জেলে দেখুন।",
    "ক্যালকুলেটর অংশের “DNA ঘনত্ব (A260)” দিয়ে হিসাব করা যায়।"
   ],
   "safe": "",
   "go": "calc:a260"
  },
  {
   "id": "sdspage",
   "t": "SDS-PAGE (Laemmli, 12% resolving gel)",
   "cat": "Protein",
   "aim": "To separate proteins according to their molecular mass.",
   "mat": [
    "30% acrylamide/bis solution",
    "1.5 M Tris-HCl pH 8.8 and 1.0 M Tris-HCl pH 6.8",
    "10% SDS, 10% APS (fresh), TEMED",
    "1× running buffer (25 mM Tris, 192 mM glycine, 0.1% SDS)",
    "Sample buffer (Laemmli) with β-mercaptoethanol or DTT",
    "Protein marker, Coomassie Brilliant Blue R-250",
    "Mini-gel apparatus and power supply"
   ],
   "steps": [
    "Assemble clean glass plates with spacers and check for leaks with water.",
    "For 10 ml of 12% resolving gel mix 3.3 ml water, 4.0 ml 30% acrylamide/bis, 2.5 ml 1.5 M Tris pH 8.8, 0.1 ml 10% SDS, 0.1 ml 10% APS and 4 µl TEMED. Add APS and TEMED last, pour immediately, overlay with water or isopropanol and let it polymerise for 30–45 min.",
    "Pour off the overlay. For 4 ml of 5% stacking gel mix 2.7 ml water, 0.67 ml 30% acrylamide/bis, 0.5 ml 1.0 M Tris pH 6.8, 0.04 ml 10% SDS, 0.04 ml 10% APS and 4 µl TEMED. Pour, insert the comb and let it polymerise for 20–30 min.",
    "Mix the samples with sample buffer, heat at 95 °C for 5 min and spin briefly.",
    "Place the gel in the tank, fill with running buffer, remove the comb and load 10–20 µl of sample and 5 µl of protein marker.",
    "Run at about 80 V until the dye enters the resolving gel, then at 120–150 V until the dye front reaches the bottom (about 60–90 min).",
    "Stain with Coomassie Brilliant Blue R-250 (0.1% in 40% methanol, 10% acetic acid) for 30–60 min and destain until the bands are clear."
   ],
   "tips": [
    "প্রায় ধারণা: ৮% জেল বড় প্রোটিনের (৫০–২০০ kDa), ১২% মাঝারির (২০–১০০ kDa), ১৫% ছোট প্রোটিনের (১০–৫০ kDa) জন্য ভালো।",
    "APS টাটকা না হলে জেল জমবে না। TEMED সবার শেষে দিন।",
    "ব্যান্ড হাসির মতো বাঁকা (smiling) হলে ভোল্টেজ কমান বা বাফার ঠান্ডা রাখুন।"
   ],
   "safe": "অ্যাক্রিলামাইড জমাট বাঁধার আগে স্নায়ুর জন্য বিষাক্ত: গ্লাভস পরুন, ত্বকে লাগতে দেবেন না।",
   "go": ""
  },
  {
   "id": "bradford",
   "t": "Protein Estimation (Bradford assay)",
   "cat": "Protein",
   "aim": "To determine protein concentration using Coomassie Brilliant Blue G-250 dye binding.",
   "mat": [
    "Bradford reagent",
    "BSA standard (for example 1 mg/ml stock)",
    "The buffer in which the samples are dissolved",
    "96-well plate or cuvettes",
    "Plate reader or spectrophotometer (595 nm)"
   ],
   "steps": [
    "Prepare BSA standards (for example 0, 0.1, 0.2, 0.4, 0.6, 0.8 and 1.0 mg/ml) by diluting the stock in the same buffer as the samples.",
    "In a 96-well plate mix 5 µl of each standard or diluted sample with 250 µl of Bradford reagent (microplate format).",
    "Mix and incubate for 5–10 min at room temperature; read within 60 min.",
    "Measure the absorbance at 595 nm, using the 0 mg/ml tube as the blank.",
    "Plot absorbance (y) against concentration (x) for the standards, fit a straight line and calculate the sample concentration from the equation. Multiply by the dilution factor."
   ],
   "tips": [
    "সব রিডিং ডুপ্লিকেটে নিন। নমুনার রিডিং স্ট্যান্ডার্ড কার্ভের পরিসরের ভেতরে থাকতে হবে, নইলে নমুনা আরও পাতলা করুন।",
    "বেশি ডিটারজেন্ট (যেমন SDS) থাকলে রিডিং বিগড়ে যায়।"
   ],
   "safe": "",
   "go": ""
  },
  {
   "id": "serial",
   "t": "Serial Dilution and Viable Count (CFU/ml)",
   "cat": "Micro",
   "aim": "To estimate the number of viable bacteria in a sample.",
   "mat": [
    "Bacterial sample",
    "Sterile 0.85% saline (9 ml in each of 6 tubes) or sterile buffer",
    "Sterile pipettes or micropipettes with tips",
    "Agar plates, spreader, incubator"
   ],
   "steps": [
    "Label six tubes 10⁻¹ to 10⁻⁶ and put 9 ml of sterile saline in each.",
    "Mix the sample well. Transfer 1 ml into the first tube (10⁻¹) and mix.",
    "Using a fresh tip each time, transfer 1 ml from tube to tube down the series.",
    "Spread 100 µl from each of the last three dilutions on agar plates (in duplicate).",
    "Incubate the plates inverted at 37 °C for 24 h.",
    "Count the plates having 30–300 colonies.",
    "CFU/ml = (number of colonies × dilution factor) ÷ volume plated (ml). For example, 150 colonies from 0.1 ml of the 10⁻⁵ dilution gives 150 × 10⁵ ÷ 0.1 = 1.5 × 10⁸ CFU/ml."
   ],
   "tips": [
    "প্রতি ধাপে নতুন টিপ নিন, নইলে আগের ঘনত্ব বয়ে যায়।",
    "৩০-এর কম বা ৩০০-এর বেশি কলোনির প্লেট গণনায় ধরা হয় না (পরিসংখ্যানগতভাবে অনির্ভরযোগ্য)।"
   ],
   "safe": "",
   "go": "calc:dilution"
  }
 ],
 "LADDER": [
  10000,
  8000,
  6000,
  5000,
  4000,
  3000,
  2000,
  1500,
  1000,
  500
 ],
 "PROTO_CATS": [
  [
   "all",
   "সব"
  ],
  [
   "DNA",
   "DNA / RNA"
  ],
  [
   "Protein",
   "প্রোটিন"
  ],
  [
   "Micro",
   "মাইক্রোবায়োলজি"
  ]
 ]
};
  for (var k in X) D[k] = X[k];
})(typeof window !== 'undefined' ? window : globalThis);
