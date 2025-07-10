import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="scroll-reveal">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">
            Join thousands of satisfied traders
          </p>
        </div>
        
        <div className="testimonials-grid">
          <div className="testimonial-card scroll-reveal">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            <p className="testimonial-text">
              "Ezabay made buying HIVE so simple. The interface is clean and the fees are the lowest I've found anywhere."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">JD</div>
              <div>
                <div className="author-name">Olowu Kayode</div>
                <div className="author-title">Crypto Trader</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card scroll-reveal">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            <p className="testimonial-text">
              "The security features give me peace of mind. I've been using Ezabay for over a year without any issues."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">SM</div>
              <div>
                <div className="author-name">Tochi Eze</div>
                <div className="author-title">Crypto Trader</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card scroll-reveal">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            <p className="testimonial-text">
              "Customer support is amazing! They helped me set up my account and answered all my questions promptly."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">MJ</div>
              <div>
                <div className="author-name">Mark Akin</div>
                <div className="author-title">Crypto Trader</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;