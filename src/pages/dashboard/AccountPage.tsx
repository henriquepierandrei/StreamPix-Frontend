import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiConfig } from "../../api/ApiConfig";
import NavBarDashboard from "../../components/navbar/NavBarDashboard";
import { Eye, EyeClosed, LockIcon, Save, Settings, User, Mail, Key, Clock } from "lucide-react";

interface AccountData {
    user_name: string;
    user_email: string;
    created_at: string;
    last_login: string;
    notifications_enabled: boolean;
    two_factor_enabled: boolean;
    email_verified: boolean;
    total_received: number; // Valor total recebido
    total_donations: number; // Total de doações
    http_response: {
        status: string;
        message: string;
    };
}

interface PasswordData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

function AccountSettings() {
    const navigate = useNavigate();
    const [active, setActive] = useState("Conta");
    const [accountData, setAccountData] = useState<AccountData>({
        user_name: "Carregando...",
        user_email: "Carregando...",
        created_at: "",
        last_login: "",
        notifications_enabled: false,
        two_factor_enabled: false,
        email_verified: false,
        total_received: 0,
        total_donations: 0,
        http_response: {
            status: "WAIT",
            message: "Carregando dados..."
        }
    });

    const [passwordData, setPasswordData] = useState<PasswordData>({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [emailBlurred, setEmailBlurred] = useState(() => {
        const saved = localStorage.getItem('emailBlurred');
        return saved ? JSON.parse(saved) : true;
    });

    const [totalReceivedBlurred, setTotalReceivedBlurred] = useState(() => {
        const saved = localStorage.getItem('totalReceivedBlurred');
        return saved ? JSON.parse(saved) : true;
    });

    const [totalDonationsBlurred, setTotalDonationsBlurred] = useState(() => {
        const saved = localStorage.getItem('totalDonationsBlurred');
        return saved ? JSON.parse(saved) : true;
    });

    // Função para alternar o blur do email
    const blurEmail = () => {
        setEmailBlurred((prev: boolean) => {
            const newState = !prev;
            localStorage.setItem('emailBlurred', JSON.stringify(newState));
            return newState;
        });
    };

    // Função para alternar o blur do valor total recebido
    const blurTotalReceived = () => {
        setTotalReceivedBlurred((prev: boolean) => {
            const newState = !prev;
            localStorage.setItem('totalReceivedBlurred', JSON.stringify(newState));
            return newState;
        });
    };

    // Função para alternar o blur do total de doações
    const blurTotalDonations = () => {
        setTotalDonationsBlurred((prev: boolean) => {
            const newState = !prev;
            localStorage.setItem('totalDonationsBlurred', JSON.stringify(newState));
            return newState;
        });
    };

    // Função para alternar visibilidade das senhas
    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSaveAccount = async () => {
        setIsLoading(true);
        try {
            const api = ApiConfig.getInstance();
            const response = await api.put('/account', accountData);
            setAccountData(prev => ({
                ...prev,
                http_response: response.data.http_response
            }));
        } catch (err) {
            console.error("Erro ao salvar conta:", err);
            setAccountData(prev => ({
                ...prev,
                http_response: {
                    status: "ERROR",
                    message: "Falha ao salvar alterações."
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            setAccountData(prev => ({
                ...prev,
                http_response: {
                    status: "ERROR",
                    message: "As senhas não coincidem."
                }
            }));
            return;
        }

        if (passwordData.new_password.length < 6) {
            setAccountData(prev => ({
                ...prev,
                http_response: {
                    status: "ERROR",
                    message: "A nova senha deve ter pelo menos 6 caracteres."
                }
            }));
            return;
        }

        setIsLoading(true);
        try {
            const api = ApiConfig.getInstance();
            const response = await api.put('/account/password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            setAccountData(prev => ({
                ...prev,
                http_response: response.data.http_response
            }));

            // Limpar campos de senha após sucesso
            if (response.data.http_response.status === "SUCCESS") {
                setPasswordData({
                    current_password: "",
                    new_password: "",
                    confirm_password: ""
                });
            }
        } catch (err) {
            console.error("Erro ao atualizar senha:", err);
            setAccountData(prev => ({
                ...prev,
                http_response: {
                    status: "ERROR",
                    message: "Falha ao atualizar senha."
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const updateAccountField = (field: keyof AccountData, value: any) => {
        setAccountData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updatePasswordField = (field: keyof PasswordData, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Buscar dados da conta ao carregar o componente
    //   useEffect(() => {
    //     (async () => {
    //       try {
    //         setIsLoading(true);
    //         const api = ApiConfig.getInstance();
    //         const response = await api.get('/account');
    //         setAccountData(response.data);
    //       } catch (err) {
    //         console.error("Erro ao buscar dados da conta:", err);
    //         navigate("/streamer/dashboard/login");
    //       } finally {
    //         setIsLoading(false);
    //       }
    //     })();
    //   }, [navigate]);

    return (
        <div className="dashboardContainer" style={{ display: "flex", gap: "10px" }}>
            <NavBarDashboard activeItem={active} onSelect={setActive} />
            <div className="gridContainer" style={{ width: "100%" }}>
                <div className="card">
                    <div className="cardTitle">
                        <User size={20} color="#667eea" />
                        <p>Informações da Conta</p>
                    </div>

                    <div className="formGroup">
                        <label>Email</label>
                        <div className='balance-display'>
                            <p
                                className='balance'
                                style={{ filter: emailBlurred ? "blur(8px)" : "none", transition: "filter 0.3s ease" }}
                            >
                                {accountData.user_email}
                            </p>
                            <div onClick={blurEmail} style={{ cursor: 'pointer' }} className="button-eye-blurred">
                                {emailBlurred ? <EyeClosed size={32} /> : <Eye size={32} />}
                            </div>
                        </div>
                    </div>

                    <div className="formGroup">
                        <label>Nome de Usuário</label>
                        <input
                            type="text"
                            value={accountData.user_name}
                            className='input'
                            onChange={(e) => updateAccountField('user_name', e.target.value)}
                        />
                    </div>

                    <div className="formGroup">
                        <label>Data de Criação</label>
                        <input
                            type="text"
                            value={new Date(accountData.created_at).toLocaleDateString('pt-BR')}
                            className='input'
                            disabled
                        />
                    </div>

                    <div className="formGroup">
                        <label>Último Login</label>
                        <input
                            type="text"
                            value={new Date(accountData.last_login).toLocaleString('pt-BR')}
                            className='input'
                            disabled
                        />
                    </div>

                    <div className="formGroup">
                        <div className='custom-checkbox-label'>
                            <input
                                type="checkbox"
                                checked={accountData.notifications_enabled}
                                onChange={(e) => updateAccountField('notifications_enabled', e.target.checked)}
                            />
                            <p>Receber Notificações por Email</p>
                        </div>
                    </div>

                    <button
                        className="saveButton"
                        onClick={handleSaveAccount}
                        disabled={isLoading}
                        style={{
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Save size={20} />
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>

                <div className="card">
                    {accountData.http_response.status !== "WAIT" && (
                        <div
                            className="formGroup"
                            style={{
                                padding: '10px',
                                borderRadius: '5px',
                                backgroundColor: accountData.http_response.status === "SUCCESS" ? '#d4edda' : '#f8d7da',
                                color: accountData.http_response.status === "SUCCESS" ? '#155724' : '#721c24',
                                fontSize: '14px'
                            }}
                        >
                            {accountData.http_response.message}
                        </div>
                    )}
                    <div className="cardTitle">
                        <Key size={20} color="#667eea" />
                        <p>Alterar Senha</p>
                    </div>

                    <div className="formGroup">
                        <label>Senha Atual</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                className='input'
                                value={passwordData.current_password}
                                onChange={(e) => updatePasswordField('current_password', e.target.value)}
                                placeholder="Digite sua senha atual"
                            />
                            <div
                                onClick={() => togglePasswordVisibility('current')}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPasswords.current ? <EyeClosed size={20} /> : <Eye size={20} />}
                            </div>
                        </div>
                    </div>

                    <div className="formGroup">
                        <label>Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                className='input'
                                value={passwordData.new_password}
                                onChange={(e) => updatePasswordField('new_password', e.target.value)}
                                placeholder="Digite a nova senha"
                            />
                            <div
                                onClick={() => togglePasswordVisibility('new')}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPasswords.new ? <EyeClosed size={20} /> : <Eye size={20} />}
                            </div>
                        </div>
                    </div>

                    <div className="formGroup">
                        <label>Confirmar Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                className='input'
                                value={passwordData.confirm_password}
                                onChange={(e) => updatePasswordField('confirm_password', e.target.value)}
                                placeholder="Confirme a nova senha"
                            />
                            <div
                                onClick={() => togglePasswordVisibility('confirm')}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPasswords.confirm ? <EyeClosed size={20} /> : <Eye size={20} />}
                            </div>
                        </div>
                    </div>

                    <button
                        className="default-button"
                        onClick={handleUpdatePassword}
                        disabled={isLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                        style={{
                            opacity: (isLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) ? 0.7 : 1,
                            cursor: (isLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <LockIcon size={20} />
                        {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>

                    <br />
                    <div className="cardTitle">
                        <Clock size={20} color="#667eea" />
                        <p>Histórico Total</p>
                    </div>

                    <div className="formGroup">
                        <label>Valor Total Recebido em Reais</label>
                        <div className='balance-display'>
                            <p
                                className='value-account-page'
                                style={{ 
                                    filter: totalReceivedBlurred ? "blur(8px)" : "none", 
                                    transition: "filter 0.3s ease",
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}
                            >
                                R$ {accountData.total_received.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <div onClick={blurTotalReceived} style={{ cursor: 'pointer' }} className="button-eye-blurred">
                                {totalReceivedBlurred ? <EyeClosed size={32} /> : <Eye size={32} />}
                            </div>
                        </div>
                    </div>

                    <div className="formGroup">
                        <label>Total de Doações Recebidas</label>
                        <div className='balance-display'>
                            <p
                                className='value-account-page'
                                style={{ 
                                    filter: totalDonationsBlurred ? "blur(8px)" : "none", 
                                    transition: "filter 0.3s ease",
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}
                            >
                                {accountData.total_donations.toLocaleString('pt-BR')} doações
                            </p>
                            <div onClick={blurTotalDonations} style={{ cursor: 'pointer' }} className="button-eye-blurred">
                                {totalDonationsBlurred ? <EyeClosed size={32} /> : <Eye size={32} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountSettings;