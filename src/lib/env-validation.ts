// Environment variable validation for production deployment

interface EnvironmentConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  tmdb: {
    apiKey: string;
    readToken: string;
    baseUrl: string;
  };
  app: {
    siteUrl: string;
  };
}

function validateRequired(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateOptional(value: string | undefined): string | undefined {
  return value || undefined;
}

export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];
  
  // Firebase configuration
  let firebaseConfig;
  try {
    firebaseConfig = {
      apiKey: validateRequired(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 'NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: validateRequired(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: validateRequired(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: validateRequired(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: validateRequired(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: validateRequired(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, 'NEXT_PUBLIC_FIREBASE_APP_ID'),
      measurementId: validateOptional(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
    };
  } catch (error) {
    errors.push(`Firebase configuration error: ${(error as Error).message}`);
  }

  // TMDB configuration
  let tmdbConfig;
  try {
    tmdbConfig = {
      apiKey: validateRequired(process.env.NEXT_PUBLIC_TMDB_API_KEY, 'NEXT_PUBLIC_TMDB_API_KEY'),
      readToken: validateRequired(process.env.NEXT_PUBLIC_TMDB_READ_TOKEN, 'NEXT_PUBLIC_TMDB_READ_TOKEN'),
      baseUrl: process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    };
  } catch (error) {
    errors.push(`TMDB configuration error: ${(error as Error).message}`);
  }

  // App configuration
  let appConfig;
  try {
    appConfig = {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || (
        process.env.NODE_ENV === 'production' 
          ? 'https://streamwherefinder.vercel.app'
          : 'http://localhost:3000'
      ),
    };
  } catch (error) {
    errors.push(`App configuration error: ${(error as Error).message}`);
  }

  if (errors.length > 0) {
    console.error('❌ ENVIRONMENT VALIDATION FAILED:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    } else {
      console.warn('⚠️  Development mode: continuing with incomplete environment');
    }
  }

  console.log('✅ Environment validation passed');
  
  return {
    firebase: firebaseConfig || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    },
    tmdb: tmdbConfig || {
      apiKey: '',
      readToken: '',
      baseUrl: 'https://api.themoviedb.org/3',
    },
    app: appConfig || {
      siteUrl: 'http://localhost:3000',
    },
  };
}

// Export validated environment
export const env = validateEnvironment();