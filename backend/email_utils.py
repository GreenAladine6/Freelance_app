import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_verification_email(app, to_email: str, verification_code: str) -> bool:
    mail_host = app.config.get('MAIL_HOST')
    mail_port = app.config.get('MAIL_PORT')
    mail_username = app.config.get('MAIL_USERNAME')
    mail_password = app.config.get('MAIL_PASSWORD')
    mail_from = app.config.get('MAIL_FROM') or mail_username
    mail_use_tls = app.config.get('MAIL_USE_TLS', True)

    if not (mail_host and mail_port and mail_username and mail_password and mail_from):
        app.logger.error('SMTP not configured. Missing MAIL_* environment values.')
        return False

    subject = 'Verify your email - Freelance App'
    body = (
        'Hi,\n\n'
        f'Your verification code is: {verification_code}\n'
        'This code expires in 15 minutes.\n\n'
        'If you did not create an account, you can ignore this email.\n'
    )

    message = MIMEMultipart()
    message['From'] = mail_from
    message['To'] = to_email
    message['Subject'] = subject
    message.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(mail_host, mail_port, timeout=20) as server:
            if mail_use_tls:
                server.starttls()
            server.login(mail_username, mail_password)
            server.sendmail(mail_from, [to_email], message.as_string())
        return True
    except Exception as exc:
        app.logger.error('Failed to send verification email: %s', exc)
        return False
