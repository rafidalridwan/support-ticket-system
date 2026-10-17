import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_RED } from "@/theme/adminColors";

const UserAvatar = ({ auth, children }) => {
    const userName = auth.user?.name || "";
    const initials = userName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="cursor-pointer rounded-full ring-2 ring-white/35 transition-all hover:ring-white"
                >
                    <Avatar>
                        <AvatarFallback style={{ backgroundColor: "#ffffff", color: ADMIN_RED }}>
                            {initials || <User className="h-4 w-4" />}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4" style={{ color: ADMIN_RED }} />
                    {userName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserAvatar;
