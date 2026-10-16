import { ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";

const BreadcrumbComponent = ({ title, items = [] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-[10px] bg-white"
            style={{ margin: "20px 16px 0px 16px", padding: "0 16px" }}
        >
            {title ? <h3 className="p-0 text-lg font-semibold">{title}</h3> : null}
            <nav className="flex flex-wrap items-center gap-1.5 py-2 text-sm text-muted-foreground">
                {items.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1.5">
                        {idx > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                        {item.href ? (
                            <Link href={item.href} className="hover:text-[var(--admin-red)]">
                                {item.title}
                            </Link>
                        ) : (
                            <span>{item.title}</span>
                        )}
                    </span>
                ))}
            </nav>
        </motion.div>
    );
};

export default BreadcrumbComponent;
