import pytz

def convert_to_us_eastern(dt):
    # Assuming the input datetime object is in UTC timezone
    dt = dt.replace(tzinfo=pytz.UTC)

    # Convert to US/Eastern timezone
    us_eastern_timezone = pytz.timezone('US/Eastern')
    dt_us_eastern = dt.astimezone(us_eastern_timezone)

    return dt_us_eastern