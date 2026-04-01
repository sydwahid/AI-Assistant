import os
import json
import logging
from datetime import datetime
import time
import smtplib
from email.message import EmailMessage

from apscheduler.schedulers.background import BackgroundScheduler

ROOT = os.path.dirname(__file__)
SCHEDULE_FILE = os.path.join(ROOT, 'schedules.json')
LOG_FILE = os.path.join(ROOT, 'reminders.log')

logging.basicConfig(level=logging.INFO, filename=LOG_FILE, format='%(asctime)s %(levelname)s: %(message)s')

scheduler = BackgroundScheduler()
notify_callback = None


def ensure_schedule_file():
    if not os.path.exists(SCHEDULE_FILE):
        with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)


def load_schedules():
    ensure_schedule_file()
    with open(SCHEDULE_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_schedules(schedules):
    with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
        json.dump(schedules, f, indent=2)


def send_reminder(task):
    """Deliver reminder. If a notify_callback is registered, call it (preferred).
    Otherwise fallback to printing/logging."""
    msg = f"Reminder: {task}"
    if notify_callback:
        try:
            notify_callback(msg)
        except Exception as e:
            logging.error(f"notify_callback failed: {e}")
    else:
        print(msg)
    logging.info(msg)


def send_whatsapp(msg: str):
    """Placeholder WhatsApp sender. Enable by setting ENABLE_WHATSAPP=1 and
    filling TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, TWILIO_TO environment vars.
    Currently this function will only log the message if not configured."""
    if os.getenv('ENABLE_WHATSAPP') != '1':
        logging.info(f"WhatsApp disabled: {msg}")
        return

    # Minimal example using Twilio REST API could go here; left as placeholder
    try:
        logging.info(f"(stub) Sending WhatsApp: {msg}")
    except Exception as e:
        logging.error(f"WhatsApp send failed: {e}")


def send_email(msg: str):
    """Simple SMTP email sender if SMTP env vars are configured.
    Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO
    If not configured, this becomes a logged stub."""
    host = os.getenv('SMTP_HOST')
    port = os.getenv('SMTP_PORT')
    user = os.getenv('SMTP_USER')
    pwd = os.getenv('SMTP_PASS')
    email_to = os.getenv('EMAIL_TO')

    if not (host and port and user and pwd and email_to):
        logging.info(f"Email not configured: {msg}")
        return

    try:
        port = int(port)
        email = EmailMessage()
        email['Subject'] = 'Jarvis Reminder'
        email['From'] = user
        email['To'] = email_to
        email.set_content(msg)

        with smtplib.SMTP(host, port, timeout=10) as smtp:
            smtp.starttls()
            smtp.login(user, pwd)
            smtp.send_message(email)

        logging.info(f"Email sent to {email_to}: {msg}")
    except Exception as e:
        logging.error(f"Email send failed: {e}")


def schedule_job(entry):
    # entry expected: {"time": "HH:MM", "task": "..."}
    time_str = entry.get('time')
    task = entry.get('task')
    if not time_str or not task:
        return
    try:
        dt = datetime.strptime(time_str, '%H:%M')
        hour = dt.hour
        minute = dt.minute

        job_id = f"reminder_{hour:02d}_{minute:02d}_{abs(hash(task)) % 10000}"
        # Remove existing job with same id if present
        try:
            scheduler.remove_job(job_id)
        except Exception:
            pass

        scheduler.add_job(send_reminder, 'cron', hour=hour, minute=minute, args=[task], id=job_id)
        logging.info(f"Scheduled job {job_id} -> {time_str} | {task}")
    except ValueError:
        logging.error(f"Invalid time format for schedule: {time_str}")


def add_schedule(time_str, task):
    schedules = load_schedules()
    schedules.append({'time': time_str, 'task': task})
    save_schedules(schedules)
    schedule_job({'time': time_str, 'task': task})


def start_scheduler():
    ensure_schedule_file()
    schedules = load_schedules()
    for entry in schedules:
        schedule_job(entry)
    scheduler.start()
    logging.info('Background scheduler started and jobs loaded.')


def start_scheduler_with_callback(cb):
    """Set a notification callback and start scheduler. CB should accept a single string argument (message)."""
    global notify_callback
    notify_callback = cb
    start_scheduler()


if __name__ == '__main__':
    start_scheduler()
    print('Scheduler running. Press Ctrl+C to exit.')
    try:
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('Stopping scheduler...')
        scheduler.shutdown()
