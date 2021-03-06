class ReportDataSource(object):
    def __init__(self, config=None):
        """
        :param config: dictionary containing configuration for this data source.
         e.g.
         {
            'startdate': date(2013, 1, 1),
            'enddate': date(2013, 1, 31),
            'user_id': 'abc'
         }
        """
        self.config = config or {}

    def configure(self, config):
        """
        :param config: dictionary containing configuration for this data source.
         Overrides any config supplied to the constructor.
        """
        self.config = config

    def slugs(self):
        """
        Intention: Override

        :return: A list of available slugs.
        """
        return []

    def get_data(self, slugs=None):
        """
        Intention: Override

        :param slugs: List of slugs to return for each row. Return all values if slugs = None or [].
        :return: A list of dictionaries mapping slugs to values.
            e.g. [{
                'village': 'Mazu',
                'births': 30,
                'deaths': 28
                },
                {...}
            ]
        """
        return {}
