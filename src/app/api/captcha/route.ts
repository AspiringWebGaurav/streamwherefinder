import { NextResponse } from 'next/server';

interface TurnstileResponse {
    success: boolean;
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
}

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Missing CAPTCHA token' },
                { status: 400 }
            );
        }

        const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

        if (!secretKey) {
            console.error('Turnstile secret key not configured');
            // In development, allow bypass
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json({ success: true, bypass: true });
            }
            return NextResponse.json(
                { success: false, error: 'CAPTCHA not configured' },
                { status: 500 }
            );
        }

        // Verify the token with Cloudflare
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);

        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            }
        );

        const result: TurnstileResponse = await verifyResponse.json();

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            console.warn('Turnstile verification failed:', result['error-codes']);
            return NextResponse.json(
                {
                    success: false,
                    error: 'CAPTCHA verification failed',
                    codes: result['error-codes']
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('CAPTCHA verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
