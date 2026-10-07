# برومبتات الموديل الـ AI: "Emma"

شخصية **خيالية** لإعلان UGC لمنتجات المطبخ. البرومبتات بالإنجليزي لأن الأدوات بتفهمه أحسن.
الأدوات المقترحة: **Nano Banana / Imagen** في Google Flow أو Gemini (للصور الثابتة)، و **Veo 3** في **Google Flow** (للفيديو بالكلام والـ lip-sync).

---

## 1) بطاقة الشخصية (Character Bible)

> الصق الوصف ده **حرفياً** في كل برومبت، عشان الشخصية تفضل نفس الشكل في كل اللقطات.

```
Emma, a fictional 31-year-old American home cook. Warm, friendly, natural girl-next-door look.
Shoulder-length wavy light-brown hair loosely tucked behind one ear, hazel eyes, light freckles
across the nose, natural brows, minimal makeup, subtle real skin texture with visible pores.
Wearing a plain sage-green linen apron over a cream crew-neck t-shirt, thin gold hoop earrings,
no other jewelry. Relaxed, genuine expressions. Does not resemble any real person or celebrity.
```

**ليه الشكل ده؟** المشتري الأساسي لمنتجات المطبخ على Amazon US ستات من 25 لـ 45 سنة، مهتمين بالأكل الصحي والبيت. Emma شكلها طبيعي وقريب منهم، مش موديل فاشون، وده بيخلّي الـ UGC يبان حقيقي.

**بدائل لو عايز تعمل A/B test:**
- **"Dan":** أب عنده 36 سنة، بيحب الشوي والطبخ. لحية خفيفة، تيشيرت رمادي، ومريلة جينز.
- **"Grace":** ست عندها 55 سنة، شعرها فضي قصير، وشكلها شكل جدة دافية. بتخاطب الجمهور الأكبر سناً.

---

## 2) صورة المرجع الأساسية (اعملها الأول)

```
Ultra-realistic smartphone photo, vertical 9:16. [CHARACTER BIBLE]
She stands in a bright, lived-in modern kitchen with white subway tiles, a wooden shelf with jars,
and a window on the left giving soft natural daylight. Medium shot from the waist up, looking
straight into the camera with a relaxed half-smile, as if about to film a TikTok.
Shot on iPhone 15 Pro front camera, natural colors, slight lens softness, no beauty filter,
no studio lighting, authentic UGC look.
```

**شيت المرجع**، عشان الشخصية تفضل ثابتة في كل اللقطات:
```
Character reference sheet of the same woman: front view, 3/4 view, side profile, and a close-up
of the face, on a plain light-gray background, same outfit and hairstyle in every view.
[CHARACTER BIBLE] Photorealistic, natural daylight, consistent identity across all views.
```

---

## 3) صور البداية لكل لقطة (Start Frames)

> ⚠️ **مهم:** في كل لقطة فيها لوح التيتانيوم، ارفع **صورة المنتج الحقيقية** كمرجع (Ingredients/Reference). ده بيضمن إن اللوح اللي يظهر يبقى نفس المنتج اللي بتبيعه (تيتانيوم مصقول، فيه فتحة للمسك وزوايا مدوّرة). لو الـ AI غيّر شكل المنتج، الإعلان هيبقى مضلل.

| # | البرومبت |
|---|---|
| A | `[CHARACTER BIBLE] holding an old, heavily used wooden cutting board close to the camera. The board has dark mold spots, deep knife grooves and brown stains. Her nose is wrinkled in disgust. Same kitchen, natural window light, vertical 9:16, realistic iPhone photo.` |
| B | `[CHARACTER BIBLE] tilting an old white plastic cutting board toward the camera, covered in deep knife scratches and yellow-orange food stains, pointing at the scratches with one finger, concerned expression. Vertical 9:16, realistic iPhone photo.` |
| C | `[CHARACTER BIBLE] holding up a brushed-titanium cutting board (use the uploaded product photo as exact reference: silver brushed metal, rounded corners, handle cut-out) with a proud, excited smile, tapping it with her fingernail. Vertical 9:16, realistic iPhone photo.` |
| D | `[CHARACTER BIBLE] slicing a lemon on the brushed-titanium cutting board (exact product reference) on the counter, lemon slices on the board, close-medium shot, natural light. Vertical 9:16.` |

---

## 4) برومبتات الفيديو (Veo 3 في Google Flow)

كل كليب أقصاه حوالي 8 ثواني. استخدم الصورة المناسبة من فوق كـ **start frame** (Frames to Video).
الكلام بين علامتين التنصيص Veo 3 بينطقه بالـ lip-sync. وحركة الكاميرا بتختارها من قايمة `/`.

**كليب 1: الهوك (0–4 ث)**، start frame من A
```
/Dolly In  Handheld selfie-style vertical video. [CHARACTER BIBLE] pushes the moldy wooden
cutting board toward the camera, disgusted, then looks straight into the lens and says:
"Stop. If your cutting board looks like this… throw it out."
Natural kitchen ambience, realistic, no music.
```

**كليب 2: البلاستيك (4–10 ث)**، start frame من B
```
Handheld vertical UGC video. [CHARACTER BIBLE] runs her fingernail across the deep scratches on
an old white plastic cutting board, camera briefly moves closer to the scratches, then back to
her face. She says: "Plastic boards get these deep scratches — and every cut scrapes tiny bits
of plastic into your food." Realistic, natural light.
```

**كليب 3: الخشب (10–15 ث)**
```
Handheld vertical UGC video. [CHARACTER BIBLE] picks up the stained, moldy wooden board, sniffs
it and grimaces, points at the dark grooves. She says: "And wood isn't better. It soaks up juice,
stains and smells." Realistic, natural light.
```

**كليب 4: ظهور التيتانيوم (15–19 ث)**، start frame من C
```
/Orbit Left  Handheld vertical UGC video. [CHARACTER BIBLE] tosses the old boards aside, lifts the
brushed-titanium cutting board (exact product reference) and taps it — a clear metallic "ting".
She smiles: "So I switched to this. One hundred percent pure titanium."
```

**كليب 5: مش بيمتص حاجة (19–25 ث)**، start frame من D
```
Handheld vertical UGC video. [CHARACTER BIBLE] slices a lemon on the titanium board, then rinses
the board under the kitchen faucet, water beading and running off the brushed metal.
She says: "Nothing soaks in. I just rinse it… and it's clean."
```

**كليب 6: السكينة والوشّين (25–32 ث)**
```
Handheld vertical UGC video. [CHARACTER BIBLE] slices a tomato smoothly on the titanium board,
then flips the board over to show the second side. She says: "It's easy on my knives — and it's
double-sided. One side for meat, one for veggies."
```

**كليب 7: الغسالة والـ CTA (32–39 ث)**
```
/Dolly Out  Handheld vertical UGC video. [CHARACTER BIBLE] slides the titanium board into the
dishwasher rack, closes it, then holds the board next to her face and smiles at the camera:
"And it goes right in the dishwasher. Best thirty-dollar kitchen upgrade. Link's below."
```

**ضيف في آخر كل برومبت فيديو** (عشان الـ AI يبعد عن الحاجات دي):
```
Avoid: extra fingers, warped hands, morphing objects, text or logos on screen, subtitles,
plastic-looking skin, over-smooth beauty filter, studio lighting, background music.
```

---

## 5) بعد التوليد

ابعتلي الكليبات كلها هنا، وأنا أعمل المونتاج في HyperFrames + ffmpeg:
- شاشة **KITCHEN WARNING** مع صوت السارينة في أول 3 ثواني.
- قص الكليبات وظبطها على 25 ثانية (والكلام اللي زيادة يتشال).
- إدخال صور المنتج الحقيقية كـ B-roll.
- كابشن كلمة بكلمة، وستيكرز، ومزيكا، و SFX.
- نهاية فيها Under $30 و ★4.7 و Shop now.

## ⚠️ قواعد لازم تمشي عليها

- **فعّل علامة "AI-generated"** وانت بترفع الإعلان. TikTok وMeta بيطلبوها في المحتوى المتولد بالـ AI اللي شكله واقعي، ولو ماحطيتهاش ممكن يرفضوا الإعلان.
- **ماتقدمش Emma على إنها "عميلة حقيقية جربت المنتج"**، ومتكتبش "verified buyer" أو "real review". الـ FTC بتعتبر ده شهادة مزيفة. الإعلان يبقى ديمو للمنتج، مش تقييم من عميل.
- **المنتج في الفيديو لازم يطابق المنتج الحقيقي** في الشكل والمميزات. أي ميزة بتتقال لازم تكون مكتوبة في الليستنج.
- **ماتستخدمش وش أي شخص حقيقي** كمرجع، ولا تكتب "looks like [celebrity]".
