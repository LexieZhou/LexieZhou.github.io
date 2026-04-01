import { motion } from 'framer-motion'
import { Github, Linkedin } from 'lucide-react'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035 } },
}

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function AnimatedName({ text, play }) {
  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate={play ? 'visible' : 'hidden'}
      aria-label={text}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          className="hero-name-letter"
          style={{ color: 'var(--text-primary)' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}

const fadeUp = (play, delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
  transition: { duration: 0.5, ease: 'easeOut', delay },
})

export default function Hero({ introComplete }) {
  return (
    <section id="hero" className="pt-[60px]">
      <div className="w-full px-6 sm:px-10 md:px-16 lg:px-24 py-16 md:py-20">
        <div className="flex flex-col-reverse md:flex-row md:items-start gap-10 md:gap-16">
          {/* Left */}
          <div className="flex-1">
            {/* Name row: English + Chinese */}
            <div className="flex items-baseline gap-3 mb-5 flex-wrap">
              <h1
                className="font-display leading-tight"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}
              >
                <AnimatedName text="Zihan (Lexie) Zhou" play={introComplete} />
              </h1>
              <motion.span
                className="font-body text-lg"
                style={{ fontFamily: "'仿宋', serif", color: 'var(--text-muted)' }}
                {...fadeUp(introComplete, 0.7)}
              >
                周子涵
              </motion.span>
            </div>

            {/* Email + socials row */}
            <motion.div className="flex items-center gap-4 mb-5" {...fadeUp(introComplete, 0.8)}>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                zhzhou02 at gmail dot com
              </span>
              <a
                href="https://github.com/LexieZhou"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/zhzhou02/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </motion.div>

            {/* Bio intro */}
            <motion.div className="mb-5 space-y-3" {...fadeUp(introComplete, 0.85)}>
              <p className="font-body text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                I am Zihan, a MSCS student at{' '}
                <a href="https://cse.ucsd.edu/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent)')}>
                  University of California San Diego
                </a>
                . I am broadly interested in LLM Reasoning, Agentic AI, and Software Development.
              </p>
              <p className="font-body text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                I received my bachelor's degree from the{' '}
                <a href="https://www.cs.hku.hk/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent)')}>
                  University of Hong Kong
                </a>
                . Previously, I worked with Prof.{' '}
                <a href="https://tianyi-zhang.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent)')}>
                  Tianyi Zhang
                </a>
                {' '}and Prof.{' '}
                <a href="https://i.cs.hku.hk/~cwu/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent)')}>
                  Chuan Wu
                </a>
                .
              </p>
              <p className="font-body text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                I'm looking for 2026 SWE/MLE internship opportunities. Feel free to contact me if you have any relevant opportunities or suggestions.
              </p>
            </motion.div>

          </div>

          {/* Right: Floating photo */}
          <motion.div
            className="flex-shrink-0 self-center md:self-start md:mt-4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={introComplete ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          >
            <div className="photo-float">
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: '190px',
                  height: '190px',
                  border: '2px solid var(--accent)',
                  boxShadow: '0 8px 40px rgba(124, 111, 91, 0.22)',
                }}
              >
                <img
                  src="/img/me.jpg"
                  alt="Zihan (Lexie) Zhou"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
