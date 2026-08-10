"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { deterministicBuilderId, pickBuilderClass } from "@/lib/builder-class";
import { initialCrop } from "@/lib/image-processing";
import type { AppStage, BuilderData, CardVariant, CropState, GeneratorFormat, PhotoAsset } from "@/types/generator";
import { ArtworkCanvas } from "./ArtworkCanvas";
import { BuilderForm } from "./BuilderForm";
import { FormatSelector } from "./FormatSelector";
import { HHGoaShell } from "./HHGoaShell";
import { PhotoEditor } from "./PhotoEditor";
import { PhotoUploader } from "./PhotoUploader";
import { ProgressRail } from "./ProgressRail";
import { ResultPreview } from "./ResultPreview";
import { RevealAnimation } from "./RevealAnimation";

const defaultBuilder: BuilderData = {
  name: "Hormaz Daruwala",
  stack: "AI + Web3 + Next.js",
  handle: "@hormaz",
  builderClass: "Agent Architect",
  builderId: deterministicBuilderId("Hormaz Daruwala"),
};

const defaultCrop: CropState = { zoom: 1, x: 0, y: -0.08 };

export function FrameInGoaApp() {
  const [stage, setStage] = useState<AppStage>("landing");
  const [format, setFormat] = useState<GeneratorFormat>("builder");
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [crop, setCrop] = useState<CropState>(defaultCrop);
  const [builder, setBuilder] = useState<BuilderData>(defaultBuilder);
  const [reroll, setReroll] = useState(0);
  const [variant, setVariant] = useState<CardVariant>("classic");
  const heroBuilderRef = useRef<HTMLCanvasElement>(null);
  const heroPfpRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (stage !== "reveal") return;
    const timer = window.setTimeout(() => setStage("result"), 850);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [stage]);

  useEffect(() => () => {
    if (photo?.src.startsWith("blob:")) URL.revokeObjectURL(photo.src);
  }, [photo]);

  function exit() {
    setStage("landing");
  }

  function handleBuilder(next: BuilderData) {
    setBuilder((current) => {
      const stackChanged = next.stack !== current.stack;
      if (stackChanged) setReroll(0);
      return {
        ...next,
        builderClass: stackChanged ? pickBuilderClass(next.stack, 0) : next.builderClass,
        builderId: deterministicBuilderId(next.name),
      };
    });
  }

  function rerollClass() {
    const next = reroll + 1;
    setReroll(next);
    setBuilder((current) => ({ ...current, builderClass: pickBuilderClass(current.stack, next) }));
  }

  function resetAll() {
    if (photo?.src.startsWith("blob:")) URL.revokeObjectURL(photo.src);
    setPhoto(null);
    setCrop(defaultCrop);
    setBuilder(defaultBuilder);
    setFormat("builder");
    setVariant("classic");
    setReroll(0);
    setStage("format");
  }

  const currentPhoto = photo?.src ?? "/demo-builder.png";

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {stage === "landing" ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HHGoaShell>
              <section className="hero">
                <div className="hero-copy">
                  <p className="hero-label">HH GOA 2026</p>
                  <h1>
                    <span>FRAME</span>
                    <span className="hero-place"><em>IN</em><strong>GOA.</strong></span>
                  </h1>
                  <p className="hero-sub">Your builder era deserves<br />a better profile picture.</p>
                  <button className="primary-button hero-cta" type="button" onClick={() => setStage("format")}>MAKE YOURS ↗</button>
                  <p className="hero-date">28—31 OCT 2026 · GOA, INDIA</p>
                </div>
                <div className="hero-art" aria-label="Examples of generated HH Goa artwork">
                  <div className="hero-card">
                    <ArtworkCanvas ref={heroBuilderRef} format="builder" photoSrc="/demo-builder.png" crop={defaultCrop} builder={defaultBuilder} variant="classic" />
                  </div>
                  <div className="hero-pfp">
                    <ArtworkCanvas ref={heroPfpRef} format="pfp" photoSrc="/demo-builder.png" crop={defaultCrop} builder={defaultBuilder} variant="classic" />
                  </div>
                  <span className="hero-note">YOUR PFP.<br />FRAME IN GOA. ↘</span>
                </div>
                <div className="hero-bottom"><span>LESS NOISE. <b>MORE SIGNAL.</b></span></div>
              </section>
            </HHGoaShell>
          </motion.div>
        ) : stage === "reveal" ? (
          <RevealAnimation key="reveal" />
        ) : (
          <motion.div key="flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HHGoaShell compact onExit={exit}>
              {stage !== "result" ? <ProgressRail active={stage === "format" ? 1 : stage === "photo" ? 2 : 3} /> : null}

              {stage === "format" ? (
                <FormatSelector
                  builder={defaultBuilder}
                  crop={defaultCrop}
                  onSelect={(nextFormat) => { setFormat(nextFormat); setStage("photo"); }}
                />
              ) : null}

              {stage === "photo" ? (
                <section className="flow-section photo-stage" aria-labelledby="photo-heading">
                  <div className="section-number">STEP 02 / LOCAL SIGNAL</div>
                  <h1 id="photo-heading" className="flow-title">DROP YOUR <em>FACE.</em></h1>
                  {photo ? (
                    <div className="editor-layout">
                      <PhotoEditor
                        photo={photo}
                        crop={crop}
                        onChange={setCrop}
                        onReset={() => setCrop(initialCrop(photo))}
                      />
                      <div className="editor-copy">
                        <p>LOOKING SHARP.<br /><em>KEEP IT HUMAN.</em></p>
                        <span>We found the signal. Drag if the crop needs a nudge.</span>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => setStage(format === "builder" ? "personalize" : "reveal")}
                        >
                          {format === "builder" ? "WHO ARE YOU? →" : "SHIP IT →"}
                        </button>
                        <button type="button" className="text-button" onClick={() => setPhoto(null)}>CHOOSE ANOTHER</button>
                      </div>
                    </div>
                  ) : (
                    <PhotoUploader onPhoto={(asset) => { setPhoto(asset); setCrop(initialCrop(asset)); }} />
                  )}
                </section>
              ) : null}

              {stage === "personalize" && photo ? (
                <section className="flow-section personalize-stage" aria-labelledby="you-heading">
                  <div className="section-number">BUILDER SIGNAL / LIVE</div>
                  <h1 id="you-heading" className="flow-title">WHO <em>ARE</em> YOU?</h1>
                  <div className="personalize-layout">
                    <div className="live-card">
                      <ArtworkCanvas ref={liveRef} format="builder" photoSrc={currentPhoto} crop={crop} builder={builder} variant={variant} />
                      <button className="edit-crop" type="button" onClick={() => setStage("photo")}>✎ EDIT CROP</button>
                    </div>
                    <div className="personalize-controls">
                      <BuilderForm value={builder} onChange={handleBuilder} onReroll={rerollClass} />
                      <button className="primary-button" type="button" onClick={() => setStage("reveal")}>SHIP IT →</button>
                      <button className="text-button back-button" type="button" onClick={() => setStage("photo")}>← BACK</button>
                      <p className="privacy-note">▣ STAYS ON THIS DEVICE UNTIL YOU CREATE A PUBLIC LINK.</p>
                    </div>
                  </div>
                </section>
              ) : null}

              {stage === "result" && photo ? (
                <ResultPreview
                  format={format}
                  photoSrc={currentPhoto}
                  crop={crop}
                  builder={builder}
                  variant={variant}
                  onVariant={setVariant}
                  onEdit={() => setStage(format === "builder" ? "personalize" : "photo")}
                  onAnother={resetAll}
                />
              ) : null}
            </HHGoaShell>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
