# تسليم: ريل الكورس بـ OpenMontage

## اللي اتعمل لحد دلوقتي
- اتسطب OpenMontage (https://github.com/calesthio/OpenMontage) بـ `make setup`. ده كان في البيئة القديمة، والبيئة الجديدة لازم تسطبه من الأول.
- اتعمل ريل TikTok من فيديو talking-head (متحدثة واحدة، 39.5 ثانية، 720×1280) بتشرح مميزات كورس:
  - هوك cold-open (فيه 3 نسخ A/B/C).
  - مقدمة "٥ حاجات".
  - 5 مميزات، لكل ميزة موشن جرافيك خاص، والشاشة بتتقسم: الموشن فوق والمتحدثة تحت.
  - CTA.
  - كابشن TikTok عربي بخط Cairo، والكلمة اللي بتتقال بتنطّ.
  - موسيقى lo-fi ومؤثرات صوتية متولدة بالكود (ببلاش).
- **الكابشن الحالي نص تجريبي**، مش كلامها الحقيقي. التفريغ ما نفعش في البيئة القديمة:
  - `huggingface.co` كان مقفول في إعدادات الشبكة.
  - نظام الصلاحيات رفض حزم Whisper البديلة.
- التكلفة لحد دلوقتي: صفر.

## الملفات (في `course-reel/` على الفرع `claude/openmontage-overview-l9b7cf`)
- `renders/course_reel_hookA_DEMO.mp4`: الريل كامل.
- `renders/hookB_preview.mp4` و`renders/hookC_preview.mp4`: أول 5.7 ثانية بالهوكات التانية.
- `reel_plan.json`: كل النصوص والتوقيتات والمميزات. ده الملف اللي بيتعدّل.
- `props_hookB.json` و`props_hookC.json`: نفس الخطة بهوك مختلف.
- `PLAN.md`: الخطة الكاملة بالتفصيل.
- `source-code/`: كود Remotion، وهو `CourseReel.tsx` و`Captions.tsx` و`FeatureGraphics.tsx` و`Hook.tsx` و`theme.ts`، ومعاه سكريبت الرندر `render-course-reel.mjs` وسكريبت الصوت `synth_audio.py`.
- `review/`: صور مراجعة للفريمات.
- **الفيديو الخام الأصلي مش على الريبو.** لازم يترفع تاني في الشات الجديد.

## إزاي ترجّع البيئة في الشات الجديد
1. `git clone https://github.com/calesthio/OpenMontage.git` في مجلد منفصل، وبعدها `make setup`.
2. انسخ `source-code/*.ts*` جوه `OpenMontage/remotion-composer/src/course-reel/`، وانسخ `render-course-reel.mjs` جوه `remotion-composer/`.
3. انسخ `reel_plan.json` جوه `src/course-reel/plan.json`، وسجّل الـ Composition اللي اسمها `CourseReel` في `src/Root.tsx`. استخدم `calculateCourseReelMetadata`، والمقاس 1080×1920 بـ 30fps.
4. سطّب الحزم دي بـ `npm i --no-save` جوه `remotion-composer`:
   `@fontsource/cairo@5 @fontsource/montserrat@5 emoji-datasource-google@16.0.0`
5. حط ملفات `public/course-reel/` كالتالي:
   - `raw.mp4`: الفيديو الخام.
   - `sfx/*.wav`: بتطلع من `python synth_audio.py public/course-reel/sfx`.
   - `emoji/<codepoints>.png`: انسخها من `node_modules/emoji-datasource-google/img/google/64`. الإيموجي المستخدمة: 😳 👇 🔥 👆 ⏱️ 🤔 👌 👩‍🏫 🛒 📱 📊.
6. الرندر: `node render-course-reel.mjs video out.mp4 [props.json]`، وهو بيستخدم Chromium من `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

## الخطوات الجاية
1. **تفريغ حقيقي:** ضيف `huggingface.co` في Allowed domains في إعدادات الشبكة، وبعدها شغّل `transcriber` (faster-whisper medium) بتاع OpenMontage. أو المستخدم يبعت النص مكتوب. النص بيتحط في `segments[].text` أو `segments[].words` جوه `reel_plan.json`.
2. اسم الكورس واليوزر الحقيقيين في `brand` و`cta`.
3. اختيار الهوك (A/B/C)، أو كتابة هوكات جديدة.
4. أفكار إضافية: نسخة 15 ثانية للإعلانات، ونسخة إنجليزي، وموسيقى حقيقية من Pixabay/Pexels.
5. المستخدم ذكر "الاسكل الجديدة" ولسه ما وضّحش هي أنهي واحدة. لازم يتسأل.

## ملاحظات مهمة
- المستخدم عايز **كل حاجة ببلاش**، فمفيش صرف كريدت في Higgsfield أو غيره من غير إذن صريح.
- المستخدم بيتكلم مصري، والرد يبقى بالمصري.
