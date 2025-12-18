import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@web/components/ui/button";
import { Code, Trophy, Users } from "lucide-react";
import { Spotlight } from "@web/components/ui/spotlight";
import { BentoGrid, BentoGridItem } from "@web/components/ui/bento-grid";

export const Route = createFileRoute("/_u/")({
  component: Home
});

function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero */}
      <section className="relative mx-auto max-w-5xl overflow-hidden px-4 py-24 text-center">
        <Spotlight
          fill="hsl(var(--primary) / 0.1)"
          className="-top-40 left-0 md:-top-20 md:left-60"
        />
        <h1 className="text-5xl font-bold tracking-tight">Luyện Code, Nâng Cấp Kỹ Năng</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
          Một nền tảng luyện tập thuật toán chất. Viết code, chạy test, đối đầu thử thách và trở
          thành coder gà top 1.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg">Bắt đầu giải bài</Button>
          <Button variant="secondary" size="lg">
            <Link to="/problem-list">Xem danh sách bài</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-6xl px-6">
          <BentoGrid>
            <BentoGridItem
              icon={<Code className="text-primary mb-4 h-10 w-10" />}
              title="Chạy Code Trực Tiếp"
              description="Trình chạy code hỗ trợ nhiều ngôn ngữ như C++, Java, Python, JavaScript và hơn thế nữa."
            />
            <BentoGridItem
              icon={<Trophy className="text-primary mb-4 h-10 w-10" />}
              title="Hệ Thống Chấm Điểm"
              description="Chấm tự động theo input test, so sánh output, tính điểm và xếp hạng."
            />
            <BentoGridItem
              icon={<Users className="text-primary mb-4 h-10 w-10" />}
              title="Cộng Đồng"
              description="So sánh lời giải, chia sẻ kiến thức và cạnh tranh trên bảng xếp hạng."
            />
          </BentoGrid>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold">Sẵn sàng thử thách bản thân?</h2>
        <p className="text-muted-foreground mt-2">Hàng trăm bài tập đang chờ bạn.</p>
        <Button size="lg" className="mt-6">
          Bắt đầu ngay
        </Button>
      </section>
    </div>
  );
}
