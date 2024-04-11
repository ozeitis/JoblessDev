import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const LogoCard = () => {
    return (
        <a href="https://successvariable.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="logo-card" style={{ cursor: 'pointer' }}>
                <CardHeader>
                    <CardTitle>Created by</CardTitle>
                    <CardDescription><img
                        src="https://i.ibb.co/FbNCrSs/Logo-2.png"
                        alt="SuccessVariable Logo"
                        className="logo"
                        width={150}
                    /></CardDescription>
                </CardHeader>
            </Card>
        </a>
    );
};

export default LogoCard;
