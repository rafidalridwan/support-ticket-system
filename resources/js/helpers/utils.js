// Helper function to format date
    export const formatDate = (dateString) => {
        if (!dateString) return "--";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            return "--";
        }
    };

    // Helper function to format datetime
    export const formatDateTime = (dateString) => {
        if (!dateString) return "--";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return "--";
        }
    };