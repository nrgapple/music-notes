import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Headphones, Heart, Zap, Play, ArrowRight, Sparkles, Waves } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onProjectSelect?: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Heart,
      title: "Emotional Connection",
      description: "Document the feelings and memories that songs inspire in you"
    },
    {
      icon: Zap,
      title: "Synchronized Notes",
      description: "Your thoughts are perfectly timed to the music as it plays"
    },
    {
      icon: Waves,
      title: "Visual Waveforms",
      description: "See the music's structure while adding your personal commentary"
    },
    {
      icon: Sparkles,
      title: "Rich Experience",
      description: "Notes appear seamlessly as the song progresses"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);



  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-flume-deep via-background to-flume-deep opacity-60" />
        
        {/* Floating Orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full blur-2xl opacity-20`}
            style={{
              background: `hsl(var(--flume-${['electric', 'purple', 'pink', 'orange'][i % 4]}))`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 120, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Particle Grid */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${(i % 10) * 10}%`,
                top: `${Math.floor(i / 10) * 20}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative"
              >
                <Music className="w-16 h-16 text-primary flume-glow" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 w-16 h-16 border-2 border-primary/30 rounded-full"
                />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold flume-glow"
              >
                Music Notes
              </motion.h1>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Capture your thoughts and{' '}
                <motion.span
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-gradient-to-r from-flume-electric via-flume-purple to-flume-pink bg-clip-text text-transparent"
                  style={{ backgroundSize: '200% 200%' }}
                >
                  emotions
                </motion.span>
                <br />
                as you listen to music
              </h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Create a meaningful connection between your thoughts and the music you love. 
                Add timestamped notes that capture the lyrics, melodies, and moments 
                that resonate with you most.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-flume-electric to-flume-purple text-white font-semibold rounded-full overflow-hidden flume-glow"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-flume-purple to-flume-pink opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="button-bg"
                />
                <span className="relative flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button
                                  onClick={() => onGetStarted()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-primary/30 text-primary font-semibold rounded-full hover:bg-primary/10 transition-colors"
              >
                View Projects
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Music That <span className="text-primary">Inspires</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every song has meaning. Now you can capture what it means to you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className={`text-center p-6 rounded-xl border border-border/50 glass transition-all duration-300 ${
                  currentFeature === index ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <motion.div
                  animate={currentFeature === index ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                >
                  <feature.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Experience Preview */}
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-8">
              Your Thoughts, <span className="text-secondary">Synchronized</span>
            </h3>
            
            {/* Mock Waveform Preview */}
            <div className="relative bg-muted/20 rounded-2xl p-8 mb-8 overflow-hidden">
              <div className="flex items-end justify-center h-32 gap-1 mb-6">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-gradient-to-t from-primary/60 to-primary/20 rounded-sm"
                    style={{ 
                      width: '3px',
                      height: `${Math.random() * 80 + 20}%`
                    }}
                    animate={{
                      scaleY: [1, Math.random() * 1.5 + 0.5, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.05
                    }}
                  />
                ))}
              </div>
              
              {/* Sample Notes */}
              <AnimatePresence>
                {[
                  { text: "Love the guitar melody here", time: "1:23", color: "flume-electric" },
                  { text: "This harmony gives me chills", time: "2:45", color: "flume-purple" },
                  { text: "Beautiful crescendo moment", time: "3:12", color: "flume-pink" }
                ].map((note, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ delay: i * 1.5, duration: 0.6 }}
                    className={`absolute bg-${note.color}/20 border border-${note.color}/40 rounded-lg p-3 text-sm max-w-xs`}
                    style={{
                      left: `${20 + i * 25}%`,
                      top: `${30 + i * 15}%`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full bg-${note.color}`} />
                      <span className="font-mono text-xs text-muted-foreground">{note.time}</span>
                    </div>
                    <p className="text-foreground">{note.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent pointer-events-none" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground mb-8"
            >
              See your notes come to life as they appear in perfect sync with the music. 
              Each comment becomes part of your personal soundtrack experience.
            </motion.p>

            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/90 transition-colors"
            >
              <Headphones className="w-5 h-5" />
              Try Music Notes
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-muted-foreground">
              Made with <Heart className="w-4 h-4 inline text-red-500" /> for music lovers everywhere
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
