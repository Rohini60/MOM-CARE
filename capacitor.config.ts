export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    cleartext?: boolean;
    url?: string;
  };
  android?: {
    buildOptions?: {
      keystorePath?: string;
      releaseType?: string;
    };
    backgroundColor?: string;
  };
}

const config: CapacitorConfig = {
  appId: 'com.momcare.app',
  appName: 'MomCare',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      releaseType: 'AAB',
    },
    backgroundColor: '#FCF8F6',
  },
};

export default config;
