from ctable.fixtures import CtableMappingFixture
from ctable.models import ColumnDef, KeyMatcher


class PatientSummaryMapping(CtableMappingFixture):
    name = 'patient_summary'
    domains = ['gsid']
    couch_view = 'gsid/patient_summary'
    schedule_active = True

    @property
    def columns(self):
        columns = [
            ColumnDef(name="domain", data_type="string", value_source="key", value_index=0),
            ColumnDef(name="disease_name", data_type="string", value_source="key", value_index=1),
            ColumnDef(name="test_version", data_type="string", value_source="key", value_index=2),
            ColumnDef(name="province", data_type="string", value_source="key", value_index=3),
            ColumnDef(name="district", data_type="string", value_source="key", value_index=4),
            ColumnDef(name="clinic", data_type="string", value_source="key", value_index=5),
            ColumnDef(name="gender", data_type="string", value_source="key", value_index=6),
            ColumnDef(name="date", data_type="date", value_source="key", value_index=7),
            ColumnDef(name="diagnosis", data_type="string", value_source="key", value_index=8),
            ColumnDef(name="age", data_type="integer", value_source="value", value_attribute="sum"),       
            ColumnDef(name="lot_number", data_type="integer", value_source="key", value_index=9),
        ]

        return columns      