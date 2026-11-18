# GENESIS 22

SUST ৩৬তম ব্যাচ, জেনেটিক ইঞ্জিনিয়ারিং ও বায়োটেকনোলজি বিভাগ। এটি স্ট্যাটিক সাইট (সার্ভার লাগে না)।

## Vercel-এ ডিপ্লয়
1. GitHub-এ নতুন রিপোজিটরি বানিয়ে এই ফোল্ডারের সব ফাইল আপলোড করুন।
2. `node build-data.js` চালিয়ে `public/data.json` আপডেট করে নিন (কনটেন্ট বদলালে প্রতিবার)।
3. vercel.com থেকে রিপোজিটরিটি Import করুন। Framework: Other। কিছু বদলাতে হবে না, `vercel.json` সব ঠিক করে দেয়।
4. Deploy চাপুন।

## কনটেন্ট কোথায় বদলাবেন
| কী | ফাইল |
|---|---|
| সিলেবাস, কোর্স, বিষয় (subjects), নোটিস, প্রশ্নপত্র | `data/seed.json`, তারপর `node build-data.js` চালিয়ে `public/data.json` আপডেট করুন |
| শিক্ষক, কর্মকর্তা, অ্যাডভাইজার | `public/teachers.js` |
| কমিউনিটি গ্রুপ ও Google Form লিংক | `public/connect.js` (`url: ''` জায়গায় লিংক বসান) |
| গ্যালারির ছবি ও ক্যাপশন | ছবি `public/gallery/`, তালিকা `public/campus.js` (`GALLERY`) |
| গ্লসারি ও বায়োটেক ডেটা | `public/bio-glossary.js`, `public/bio-data.js` |
| ক্লাস রুটিন | `data/seed.json`-এর `routine`, প্ল্যানারের নমুনা `public/planner.js` (`SAMPLE_S`) |
| নোটিস বোর্ড | `data/seed.json`-এর `notices` (type: info/new/warn, pinned, until) |
| লাইব্রেরি (লেকচার, বই, নোট) | `data/seed.json`-এর `library`, কোর্স কোড ধরে। নিয়ম `public/library.js`-এর শুরুতে |
| কোর্সের বিস্তারিত সিলেবাস | `data/seed.json`-এর `details` (কারিকুলাম PDF থেকে ৬৮টি কোর্স বসানো) |

## সীমাবদ্ধতা
- ব্যবহারকারীর ডেটা (প্ল্যানার, পরীক্ষার ফল, নোটবুক) প্রতিজনের নিজের ব্রাউজারে থাকে, ডিভাইস বদলালে যায় না।
- লগইন, অ্যাডমিন প্যানেল ও লাইভ রুম নেই। আলোচনা গ্রুপে, জমা দেওয়া Google Form-এ।
