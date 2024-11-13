interface IAudioEngineOptions {
  audioContext?: AudioContext;
  audioDestination?: AudioDestinationNode | MediaStreamAudioDestinationNode;
}

export interface EngineOptions {
  adaptToDeviceRatio?: boolean;
  antialias?: boolean;
  audioEngine?: boolean;
  audioEngineOptions?: IAudioEngineOptions;
  deterministicLockstep?: boolean;
  disableWebGL2Support?: boolean;
  doNotHandleContextLost?: boolean;
  doNotHandleTouchAction?: boolean;
  failIfMajorPerformanceCaveat?: boolean;
  forceSRGBBufferSupportState?: boolean;
  limitDeviceRatio?: number;
  lockstepMaxSteps?: number;
  loseContextOnDispose?: boolean;
  premultipliedAlpha?: boolean;
  stencil?: boolean;
  timeStep?: number;
  useExactSrgbConversions?: boolean;
  useHighPrecisionFloats?: boolean;
  useHighPrecisionMatrix?: boolean;
  xrCompatible?: boolean;
}

export interface SceneOptions {
  useClonedMeshMap?: boolean;
  useGeometryUniqueIdsMap?: boolean;
  useMaterialMeshMap?: boolean;
  virtual?: boolean;
}
