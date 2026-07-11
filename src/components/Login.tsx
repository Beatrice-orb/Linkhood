import React, { useState } from 'react';
import { ShieldCheck, Phone, Key, HelpCircle, Home, Building2, Flag, Heart } from 'lucide-react';
import { Role } from '../types';

interface LoginProps {
  onLoginSuccess: (phone: string, role: Role) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [phone, setPhone] = useState('13812345678');
  const [code, setCode] = useState('888888');
  const [role, setRole] = useState<Role>('COMMUNITY_STAFF');
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const sendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号码');
      return;
    }
    setError('');
    setIsSending(true);
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSending(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号码');
      return;
    }
    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    setError('');
    onLoginSuccess(phone, role);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 selection:bg-jade/30 selection:text-jade font-sans animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-hairline rounded-2xl p-8 shadow-xl relative overflow-hidden">
        {/* Glow effect at the top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-jade to-transparent opacity-60" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-jade-light text-jade border border-jade/20 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight text-ink">
            「搭把手」To G端社区治理系统
          </h1>
          <p className="text-xs text-ink-muted mt-1.5">
            一个社区 · 应该有一张地图 · 让社区工作更智慧温暖
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-coral-light/20 border border-coral/30 text-coral rounded-lg text-xs animate-scale-up">
              {error}
            </div>
          )}

          <div>
            <label className="block text-2xs font-medium uppercase tracking-wider text-ink-muted mb-2">
              手机号码
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入11位手机号码"
                className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline rounded-xl text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                maxLength={11}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-medium uppercase tracking-wider text-ink-muted mb-2">
              短信验证码
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  className="w-full pl-10 pr-4 py-3 bg-canvas border border-hairline rounded-xl text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="button"
                onClick={sendCode}
                disabled={isSending}
                className="px-4 bg-surface hover:bg-canvas text-xs text-jade border border-hairline hover:border-jade/30 rounded-xl transition-all disabled:text-ink-subtle disabled:bg-canvas disabled:border-hairline min-w-[110px]"
              >
                {isSending ? `${countdown}s 后重试` : '获取验证码'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-jade hover:bg-jade-hover text-canvas font-medium text-sm rounded-xl transition-colors mt-4 shadow-md cursor-pointer text-center"
          >
            进入治理工作台
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-hairline text-center text-2xs text-ink-subtle flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          首次登录将按手机号码自动关联网格与职务体系
        </div>
      </div>
    </div>
  );
}
