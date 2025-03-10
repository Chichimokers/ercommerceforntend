import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, ReactNode } from 'react';

interface ZoomProps {
	children: ReactNode;
	triggerOnce?: boolean;
	threshold?: number;
	delay?: number;
	duration?: number;
	className?: string;
	scale?: number;
}

const Zoom = ({
	children,
	triggerOnce = true,
	threshold = 0.2,
	delay = 0.2,
	duration = 0.6,
	className = '',
	scale = 0.85
}: ZoomProps) => {
	const controls = useAnimation();
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					controls.start('visible');
					if (triggerOnce) {
						observer.disconnect();
					}
				} else if (!triggerOnce) {
					setIsVisible(false);
					controls.start('hidden');
				}
			},
			{
				threshold,
				rootMargin: '10px',
			}
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, [controls, threshold, triggerOnce]);

	const variants = {
		hidden: {
			opacity: 0,
			scale: scale
		},
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration,
				delay,
				ease: [0.25, 0.1, 0.25, 1],
			}
		}
	};

	return (
		<div ref={ref} className={className}>
			<AnimatePresence>
				<motion.div
					variants={variants}
					initial="hidden"
					animate={controls}
				>
					{children}
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

export default Zoom;