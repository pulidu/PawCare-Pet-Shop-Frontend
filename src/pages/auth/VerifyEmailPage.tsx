import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import api from '@/services/api';

type VerifyStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setMessage(res.data.message || 'Email verified successfully!');
        setStatus('success');
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message || 'Verification failed. The link may be expired.';
        setMessage(msg);
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Email Verification</h2>
      </div>

      <motion.div
        key={status}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 py-6"
      >
        {status === 'loading' ? (
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        ) : status === 'success' ? (
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        ) : (
          <XCircle className="h-16 w-16 text-destructive" />
        )}

        <p className="text-center text-sm text-muted-foreground">{message}</p>

        {status === 'success' && (
          <Button asChild>
            <Link to="/auth/login">Go to Login</Link>
          </Button>
        )}

        {status === 'error' && (
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
